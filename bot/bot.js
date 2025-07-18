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
