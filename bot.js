const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');

// Token diambil dari Environment Variable di Railway nanti
const token = process.env.8309505054:AAGGOkzQKs_qjablWJsSA1a9TeXhCJt82oc;
const bot = new TelegramBot(token, {polling: true});

// GANTI LINK INI DENGAN LINK VERCEL ANDA
const WEB_APP_URL = 'https://dramaxin-box.vercel.app';

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "🎬 **DRAMAXIN BOX - TELEGRAM**\n\nSelamat datang! Ketik judul drama yang ingin dicari atau klik tombol di bawah untuk membuka aplikasi.", {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [[{ text: "🚀 BUKA APLIKASI", web_app: { url: WEB_APP_URL } }]]
        }
    });
});

// Logika Pencarian
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    if (!text || text.startsWith('/')) return;

    try {
        // Ambil data dari API
        const res = await fetch("https://api.sansekai.my.id/api/dramabox/trending");
        const json = await res.json();
        const dramas = json.data?.data || json.data || [];
        
        // Filter drama berdasarkan input user
        const results = dramas.filter(d => (d.bookName || d.title || "").toLowerCase().includes(text.toLowerCase())).slice(0, 3);

        if (results.length === 0) {
            return bot.sendMessage(chatId, "❌ Maaf, drama tidak ditemukan.");
        }

        for (const item of results) {
            const id = item.bookId || item.id;
            const name = item.bookName || item.title;
            const cover = item.coverWap || item.cover;

            bot.sendPhoto(chatId, cover, {
                caption: `🎬 *${name}*`,
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[
                        // Link ini membawa parameter bookId ke Website
                        { text: "📺 TONTON SEKARANG", web_app: { url: `${WEB_APP_URL}?bookId=${id}` } }
                    ]]
                }
            });
        }
    } catch (e) {
        console.log("Error:", e);
    }
});

console.log("Bot Dramaxin sedang berjalan...");
