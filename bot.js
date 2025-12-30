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

  // Abaikan perintah bot atau pesan kosong
  if (!text || text.startsWith('/')) return;

  try {
    // Memanggil API search dengan query sesuai input user
    const searchUrl = `https://api.sansekai.my.id/api/dramabox/search?query=${encodeURIComponent(text)}`;
    const response = await fetch(searchUrl);
    const json = await response.json();
    
    // Mengambil data berdasarkan struktur respons API pencarian
    const results = json.data?.data || json.data || json;

    if (!Array.isArray(results) || results.length === 0) {
      return bot.sendMessage(chatId, `❌ Maaf, drama dengan kata kunci "${text}" tidak ditemukan.`);
    }

    // Menampilkan 3 hasil teratas agar tidak spam di chat
    const limitedResults = results.slice(0, 3);

    for (const item of limitedResults) {
      // Menggunakan bookId dan bookName sesuai contoh JSON pencarian
      const id = item.bookId || item.id;
      const name = item.bookName || item.title;
      const cover = item.cover || item.coverWap;

      bot.sendPhoto(chatId, cover, {
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
        bot.sendMessage(chatId, "⚠️ Server sedang sibuk.");
    }
});
