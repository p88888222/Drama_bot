const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// PENTING: Ganti dengan domain Vercel Anda yang aktif (Tanpa / di akhir)
const WEB_APP_URL = 'https://dramaxin-box.vercel.app';
const SEARCH_API = "https://api.sansekai.my.id/api/dramabox/search?query=";

console.log("Bot Dramaxin Sinkron AKTIF...");

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "🎬 **DRAMAXIN BOX**\n\nKetik judul drama untuk mencari langsung ke database.", {
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
        const response = await fetch(`${SEARCH_API}${encodeURIComponent(text)}`);
        const json = await response.json();
        const results = json.data?.data || json.data || [];

        if (results.length === 0) {
            return bot.sendMessage(chatId, `❌ Judul "${text}" tidak ditemukan.`);
        }

        for (const item of results.slice(0, 3)) {
            const id = item.bookId || item.id;
            const name = item.bookName || item.title;
            const cover = item.cover || item.coverWap;

            bot.sendPhoto(chatId, cover, {
                caption: `🎬 *${name}*`,
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[
                        { text: "📺 TONTON", web_app: { url: `${WEB_APP_URL}?bookId=${id}` } }
                    ]]
                }
            });
        }
    } catch (e) {
        bot.sendMessage(chatId, "⚠️ Server sedang sibuk.");
    }
});
