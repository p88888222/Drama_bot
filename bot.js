const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');

// Pastikan variabel TELEGRAM_TOKEN sudah diisi di tab Variables Railway
const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// PENTING: Ganti dengan link Vercel Anda yang aktif (Tanpa tanda / di akhir)
const WEB_APP_URL = 'https://dramaxin-anda.vercel.app';
const SEARCH_API = "https://api.sansekai.my.id/api/dramabox/search?query=";

console.log("Bot Dramaxin Sinkron Web Query AKTIF...");

// Respon perintah /start
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "🎬 **DRAMAXIN BOX**\n\nKetik judul drama (contoh: *pewaris*) untuk mencari langsung dari database kami.", {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [[{ text: "🚀 BUKA APLIKASI", web_app: { url: WEB_APP_URL } }]]
        }
    });
});

// Logika Pencarian Universal
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text || text.startsWith('/')) return;

    try {
        const response = await fetch(`${SEARCH_API}${encodeURIComponent(text)}`);
        const json = await response.json();
        
        // Ekstraksi data secara fleksibel
        const results = json.data?.data || json.data || [];

        if (results.length === 0) {
            return bot.sendMessage(chatId, `❌ Judul "${text}" tidak ditemukan.`);
        }

        // Tampilkan maksimal 3 hasil
        for (const item of results.slice(0, 3)) {
            const id = item.bookId || item.id;
            const name = item.bookName || item.title;
            const cover = item.cover || item.coverWap;

            await bot.sendPhoto(chatId, cover, {
                caption: `🎬 *${name}*`,
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[
                        { text: "📺 TONTON SEKARANG", web_app: { url: `${WEB_APP_URL}?bookId=${id}` } }
                    ]]
                }
            });
        }
    } catch (e) {
        console.error(e);
        bot.sendMessage(chatId, "⚠️ Server API sedang sibuk, silakan coba lagi.");
    }
});
