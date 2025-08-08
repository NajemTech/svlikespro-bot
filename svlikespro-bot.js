// svlikespro-bot.js
// Telegram bot for SVLikes Pro panel with WebView button and fixed reply_markup

const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// === CONFIG ===
const BOT_TOKEN = process.env.BOT_TOKEN || '8015998674:AAHZtvzrwZc7KwmvvchHu7lUwURMH0kznwM';
const PANEL_API_URL = process.env.PANEL_API_URL || 'https://svlikespro.com/privateApi';
const PANEL_TOKEN = process.env.PANEL_TOKEN || 'HSQ0BDrD3Ksh5FzT3guJbUYmKhNDu3sXQytXmlvGfx1e9OX4KFnWA3OAwcqT';
const PANEL_URL = 'https://svlikespro.com';

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// === SEND MESSAGE ===
async function sendMessage(chatId, text, replyMarkup = null) {
  const payload = {
    chat_id: chatId,
    text: text
  };
  if (replyMarkup) {
    payload.reply_markup = {
      inline_keyboard: replyMarkup.inline_keyboard
    };
  }
  await axios.post(`${TELEGRAM_API}/sendMessage`, payload);
}

// === HANDLE COMMANDS ===
app.post('/webhook', async (req, res) => {
  const message = req.body.message;
  if (!message || !message.text) return res.sendStatus(200);

  const chatId = message.chat.id;
  const text = message.text.trim();

  if (text === '/start') {
    const button = {
      inline_keyboard: [[
        {
          text: '🧾 Open My Dashboard',
          url: PANEL_URL
        }
      ]]
    };
    await sendMessage(chatId, `👋 Welcome to SVLikes Pro Bot\nUse the button below to access your dashboard.`, button);
  }

  else if (text === '/orders') {
    try {
      const response = await axios.get(`${PANEL_API_URL}/getOrders`, {
        params: {
          token: PANEL_TOKEN,
          limit: 5
        }
      });

      const orders = response.data.items || [];
      if (orders.length === 0) return sendMessage(chatId, '📭 No recent orders.');

      const formatted = orders.map(o => (
        `#${o.id} • ${o.status}\n💵 $${o.charge} • Service: ${o.service_id}\n👤 ${o.user?.login || 'N/A'}`
      )).join('\n\n');

      await sendMessage(chatId, `📦 Latest Orders:\n${formatted}`);
    } catch (e) {
      const errMsg = e.response?.data?.error || e.message || 'Unknown error';
      await sendMessage(chatId, `❌ Error fetching orders:\n${errMsg}`);
    }
  }

  else {
    await sendMessage(chatId, `❓ Unknown command. Try /start`);
  }

  res.sendStatus(200);
});

// === START SERVER ===
const PORT = process.env.PORT || 5555;
app.listen(PORT, () => {
  console.log(`🤖 SVLikesPro bot is running on port ${PORT}`);
});
