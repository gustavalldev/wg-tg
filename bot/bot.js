require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const WG_API_URL = process.env.WG_API_URL || 'http://localhost:3000';

// Простая база пользователей (в памяти, для MVP)
const users = new Map();

// Генерация IP адреса для нового peer
function generateIP() {
    // Начинаем с 10.8.0.2 (10.8.0.1 - сервер)
    const baseIP = 2;
    const usedIPs = Array.from(users.values());
    
    for (let i = baseIP; i <= 254; i++) {
        const ip = `10.8.0.${i}`;
        if (!usedIPs.includes(ip)) {
            return ip;
        }
    }
    throw new Error('Нет свободных IP адресов');
}

// /start
bot.start((ctx) => {
    ctx.reply('👋 Привет! Я бот для выдачи VPN-доступа. Используй /getvpn чтобы получить конфиг, или /remove чтобы удалить свой доступ.');
});

// /getvpn
bot.command('getvpn', async (ctx) => {
    try {
        const userId = ctx.from.id.toString();
        
        // Проверяем, есть ли уже peer у пользователя
        if (users.has(userId)) {
            ctx.reply('❌ У вас уже есть VPN-профиль. Используйте /remove чтобы удалить старый профиль.');
            return;
        }
        
        ctx.reply('🔧 Генерирую peer и конфиг...');
        
        // Генерируем имя и IP
        const peerName = `tg_${userId}`;
        const peerIP = generateIP();
        
        // Создаём peer через API
        const response = await axios.post(`${WG_API_URL}/api/peers`, {
            name: peerName,
            ip: peerIP
        });
        
        // Сохраняем информацию о пользователе
        users.set(userId, peerIP);
        
        // Отправляем конфиг
        await ctx.replyWithDocument({
            source: Buffer.from(response.data.config),
            filename: `wg-${userId}.conf`
        });
        
        ctx.reply('✅ Ваш VPN-профиль готов!');
        
    } catch (err) {
        console.error('Ошибка /getvpn:', err.response?.data || err.message);
        ctx.reply('❌ Ошибка при создании peer. Попробуйте позже.');
    }
});

// /remove
bot.command('remove', async (ctx) => {
    try {
        const userId = ctx.from.id.toString();
        
        // Проверяем, есть ли peer у пользователя
        if (!users.has(userId)) {
            ctx.reply('❌ У вас нет активного VPN-профиля.');
            return;
        }
        
        ctx.reply('🗑️ Удаляю ваш VPN-профиль...');
        
        const peerName = `tg_${userId}`;
        
        // Удаляем peer через API
        await axios.delete(`${WG_API_URL}/api/peers/${peerName}`);
        
        // Удаляем из базы пользователей
        users.delete(userId);
        
        ctx.reply('✅ Ваш VPN-профиль удалён.');
        
    } catch (err) {
        console.error('Ошибка /remove:', err.response?.data || err.message);
        ctx.reply('❌ Ошибка при удалении peer. Попробуйте позже.');
    }
});

// /status - проверка статуса API
bot.command('status', async (ctx) => {
    try {
        const response = await axios.get(`${WG_API_URL}/health`);
        ctx.reply('✅ API работает корректно');
    } catch (err) {
        ctx.reply('❌ API недоступен');
    }
});

// Запуск бота
bot.launch();

console.log('🤖 Бот запущен!');
console.log(`🔗 API URL: ${WG_API_URL}`);

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
