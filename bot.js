const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');

const token = process.env.TELEGRAM_TOKEN;
if (!token) {
  console.error("ERROR: TELEGRAM_TOKEN kosong di Railway!");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// PENTING: GANTI DENGAN LINK VERCEL ANDA YANG AKTIF (CEK DI CHROME DULU)
const WEB_APP_URL = 'https://dramaxin-box.vercel.app';

console.log("Bot berjalan dengan mode Pencarian Web...");

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🎬 **DRAMAXIN BOX**\n\nKetik judul drama (contoh: pewaris) untuk mencari langsung ke database.", {
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
    // Memanggil API Search menggunakan query (Sesuai metode Web)
    const response = await fetch(`https://api.sansekai.my.id/api/dramabox/search?query=${encodeURIComponent(text)}`);
    const json = await response.json();
    
    // Mengambil array data dari hasil pencarian
    const results = json.data?.data || json.data || [];

    if (!Array.isArray(results) || results.length === 0) {
      return bot.sendMessage(chatId, `❌ Judul "${text}" tidak ditemukan.`);
    }

    // Ambil 3 hasil teratas
    for (const item of results.slice(0, 3)) {
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
    bot.sendMessage(chatId, "⚠️ Gagal menghubungi server pencarian.");
  }
});
