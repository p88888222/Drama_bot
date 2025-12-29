const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');

// Token diambil dari Environment Variable di Railway nanti
const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, {polling: true});

// GANTI LINK INI DENGAN LINK VERCEL ANDA
const WEB_APP_URL = 'https://URL_VERCEL_ANDA.vercel.app';

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "🎬 **DRAMAXIN BOX**\n\nSelamat datang! Cari drama favoritmu atau klik tombol di bawah.", {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [[{ text: "🚀 BUKA APLIKASI", web_app: { url: WEB_APP_URL } }]]
        }
    });
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    if (!text || text.startsWith('/')) return;

    try {
        const res = await fetch("https://api.sansekai.my.id/api/dramabox/trending");
        const json = await res.json();
        const dramas = json.data?.data || json.data || [];
        const results = dramas.filter(d => (d.bookName || d.title).toLowerCase().includes(text.toLowerCase())).slice(0, 3);

        if (results.length === 0) return bot.sendMessage(chatId, "❌ Tidak ditemukan.");

        for (const item of results) {
            bot.sendPhoto(chatId, item.cover || item.coverWap, {
                caption: `🎬 *${item.bookName || item.title}*`,
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[{ text: "📺 TONTON", web_app: { url: `${WEB_APP_URL}?bookId=${item.bookId || item.id}` } }]]
                }
            });
        }
    } catch (e) { console.log(e); }
});

console.log("Bot berjalan...");
