const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');

// Token dari Environment Variable Railway
const token = process.env.TELEGRAM_TOKEN;
if (!token) {
  console.error("ERROR: TELEGRAM_TOKEN belum diisi di Railway!");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// PENTING: Ganti dengan link Vercel Anda yang AKTIF
const WEB_APP_URL = 'https://drmaxin-box.vercel.app';

console.log("Bot Dramaxin sedang berjalan dengan metode Query...");

// Perintah /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🎬 **DRAMAXIN BOX - SEARCH ENGINE**\n\nSelamat datang! Silakan ketik judul drama (contoh: pewaris) untuk mencari secara langsung melalui database.", {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[{ text: "🚀 BUKA APLIKASI", web_app: { url: WEB_APP_URL } }]]
    }
  });
});

// Logika Pencarian Menggunakan Parameter ?query= (Sama dengan Web)
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
    console.error("API Search Error:", e.message);
    bot.sendMessage(chatId, "⚠️ Terjadi gangguan saat menghubungi server pencarian.");
  }
});

