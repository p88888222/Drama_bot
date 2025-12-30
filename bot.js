const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');

// Mengambil token dari Environment Variable Railway
const token = process.env.TELEGRAM_TOKEN;

// Validasi Token agar tidak error saat start
if (!token) {
  console.error("ERROR: TELEGRAM_TOKEN tidak ditemukan di Variables Railway!");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// GANTI LINK INI DENGAN LINK VERCEL ANDA YANG AKTIF
const WEB_APP_URL = 'https://dramaxin-box.vercel.app';

console.log("Bot Dramaxin sedang berjalan...");

// Perintah /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🎬 **DRAMAXIN BOX - ONLINE**\n\nKetik judul drama untuk mencari, atau klik tombol di bawah.", {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[{ text: "🚀 BUKA APLIKASI", web_app: { url: WEB_APP_URL } }]]
    }
  });
});

// Respon pesan teks
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith('/')) return;

  try {
    const res = await fetch("https://api.sansekai.my.id/api/dramabox/trending");
    const json = await res.json();
    const dramas = json.data?.data || json.data || [];
    
    const results = dramas.filter(d => 
      (d.bookName || d.title || "").toLowerCase().includes(text.toLowerCase())
    ).slice(0, 3);

    if (results.length === 0) {
      return bot.sendMessage(chatId, "❌ Drama tidak ditemukan.");
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
            { text: "📺 TONTON", web_app: { url: `${WEB_APP_URL}?bookId=${id}` } }
          ]]
        }
      });
    }
  } catch (e) {
    console.error("API Error:", e.message);
  }
});
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith('/')) return;

  try {
    // Mengambil data dari 3 sumber sekaligus agar hasil lebih pasti ditemukan
    const [res1, res2] = await Promise.all([
      fetch("https://api.sansekai.my.id/api/dramabox/trending"),
      fetch("https://api.sansekai.my.id/api/dramabox/latest")
    ]);
    
    const json1 = await res1.json();
    const json2 = await res2.json();
    
    const allDramas = [
      ...(json1.data?.data || json1.data || []),
      ...(json2.data?.data || json2.data || [])
    ];
    
    // Menghapus duplikat dan mencari judul yang cocok
    const uniqueDramas = Array.from(new Map(allDramas.map(item => [item.bookId || item.id, item])).values());
    const results = uniqueDramas.filter(d => 
      (d.bookName || d.title || "").toLowerCase().includes(text.toLowerCase())
    ).slice(0, 3);

    if (results.length === 0) {
      return bot.sendMessage(chatId, "❌ Maaf, judul tersebut tidak ditemukan di koleksi kami.");
    }

    for (const item of results) {
      bot.sendPhoto(chatId, item.coverWap || item.cover, {
        caption: `🎬 *${item.bookName || item.title}*`,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: "📺 TONTON DI APLIKASI", web_app: { url: `${WEB_APP_URL}?bookId=${item.bookId || item.id}` } }
          ]]
        }
      });
    }
  } catch (e) {
    bot.sendMessage(chatId, "⚠️ Terjadi gangguan koneksi ke server drama.");
  }
});
