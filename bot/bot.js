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
bot.start(async (ctx) => {
    try {
        await ctx.reply('👋 Привет! Я бот для выдачи VPN-доступа. Используй /getvpn чтобы получить конфиг, или /remove чтобы удалить свой доступ.');
    } catch (err) {
        handleTelegramError(err, ctx);
    }
});

// /getvpn
bot.command('getvpn', async (ctx) => {
    try {
        const userId = ctx.from.id.toString();
        
        if (users.has(userId)) {
            await ctx.reply('❌ У вас уже есть VPN-профиль. Используйте /remove чтобы удалить старый профиль.');
            return;
        }

        await ctx.reply('🔧 Генерирую peer и конфиг...');
        
        const peerName = `tg_${userId}`;
        const peerIP = generateIP();
        
        const response = await axios.post(`${WG_API_URL}/api/peers`, {
            name: peerName,
            ip: peerIP
        });
        
        users.set(userId, peerIP);
        
        await ctx.replyWithDocument({
            source: Buffer.from(response.data.config),
            filename: `wg-${userId}.conf`
        });
        
        await ctx.reply('✅ Ваш VPN-профиль готов!');
        
    } catch (err) {
        console.error('Ошибка /getvpn:', err.response?.data || err.message);
        try {
            await ctx.reply('❌ Ошибка при создании peer. Попробуйте позже.');
        } catch (innerErr) {
            handleTelegramError(innerErr, ctx);
        }
    }
});

// /remove
bot.command('remove', async (ctx) => {
    try {
        const userId = ctx.from.id.toString();
        
        if (!users.has(userId)) {
            await ctx.reply('❌ У вас нет активного VPN-профиля.');
            return;
        }
        
        await ctx.reply('🗑️ Удаляю ваш VPN-профиль...');
        
        const peerName = `tg_${userId}`;
        await axios.delete(`${WG_API_URL}/api/peers/${peerName}`);
        
        users.delete(userId);
        
        await ctx.reply('✅ Ваш VPN-профиль удалён.');
        
    } catch (err) {
        console.error('Ошибка /remove:', err.response?.data || err.message);
        try {
            await ctx.reply('❌ Ошибка при удалении peer. Попробуйте позже.');
        } catch (innerErr) {
            handleTelegramError(innerErr, ctx);
        }
    }
});

// /status
bot.command('status', async (ctx) => {
    try {
        const response = await axios.get(`${WG_API_URL}/health`);
        await ctx.reply('✅ API работает корректно');
    } catch (err) {
        try {
            await ctx.reply('❌ API недоступен');
        } catch (innerErr) {
            handleTelegramError(innerErr, ctx);
        }
    }
});

// Общая функция для обработки 403 ошибок
function handleTelegramError(err, ctx) {
    if (err.response?.data?.description?.includes('bot was blocked')) {
        console.warn(`⚠️ Пользователь ${ctx.from?.id} заблокировал бота`);
    } else {
        console.error('Ошибка Telegram:', err.message);
    }
}
