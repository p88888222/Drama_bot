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

console.log("Bot berjalan dengan metode sinkronisasi Web Query...");

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🎬 **DRAMAXIN BOX**\n\nKetik judul drama langsung di sini untuk mencari.", {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[{ text: "🚀 BUKA APLIKASI", web_app: { url: WEB_APP_URL } }]]
    }
  });
});

// Logika Pencarian menggunakan data query (Sama dengan Web)
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith('/')) return;

  try {
    // Memanggil endpoint search dengan parameter query
    const response = await fetch(`https://api.sansekai.my.id/api/dramabox/search?query=${encodeURIComponent(text)}`);
    const json = await response.json();
    
    // Mengambil data dari properti 'data' (struktur umum API search)
    let results = [];
    if (json.data && Array.isArray(json.data)) {
      results = json.data;
    } else if (json.data && json.data.data) {
      results = json.data.data;
    }

    if (results.length === 0) {
      return bot.sendMessage(chatId, `❌ Judul "${text}" tidak ditemukan.`);
    }

    // Menampilkan maksimal 3 hasil agar chat tetap rapi
    for (const item of results.slice(0, 3)) {
      // Menyamakan field dengan data yang sering muncul di API pencarian
      const id = item.bookId || item.id || item.dramaId;
      const name = item.bookName || item.title;
      const cover = item.cover || item.coverWap;

      if (!id) continue;

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
    console.error("Search Error:", e);
    bot.sendMessage(chatId, "⚠️ Terjadi gangguan saat menghubungi server pencarian.");
  }
});
