// svlikespro-bot.js
// Custom Telegram bot for SMM panel using Node.js and Render

const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// === CONFIG ===
const BOT_TOKEN = process.env.BOT_TOKEN || '8015998674:AAHZtvzrwZc7KwmvvchHu7lUwURMH0kznwM';
const PANEL_API_URL = process.env.PANEL_API_URL || 'https://svlikespro.com/privateApi';
const PANEL_TOKEN = process.env.PANEL_TOKEN || 'HSQ0BDrD3Ksh5FzT3guJbUYmKhNDu3sXQytXmlvGfx1e9OX4KFnWA3OAwcqT';

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// === SEND MESSAGE TO USER ===
async function sendMessage(chatId, text) {
  await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text: text,
  });
}

// === HANDLE COMMANDS ===
app.post(`/webhook`, async (req, res) => {
  const message = req.body.message;
  if (!message || !message.text) return res.sendStatus(200);

  const chatId = message.chat.id;
  const text = message.text.trim();

  if (text === '/start') {
    await sendMessage(chatId, `👋 Welcome to SVLikes Pro Bot\nYou can use:\n/orders - check latest orders\n/balance - check your balance`);
  }

  else if (text === '/balance') {
    try {
      const response = await axios.post(`${PANEL_API_URL}/getUser`, {
        token: PANEL_TOKEN
      });
      const balance = response.data.balance;
      await sendMessage(chatId, `💰 Your current balance is: $${balance}`);
    } catch (e) {
      await sendMessage(chatId, `❌ Error getting balance.`);
    }
  }

  else if (text === '/orders') {
    try {
      const response = await axios.post(`${PANEL_API_URL}/getOrders`, {
        token: PANEL_TOKEN,
        limit: 5
      });
      const orders = response.data.orders || [];
      if (orders.length === 0) return sendMessage(chatId, '📭 No recent orders.');
      const formatted = orders.map(o => `#${o.order} • ${o.status} • $${o.price}`).join('\n');
      await sendMessage(chatId, `📦 Latest Orders:\n${formatted}`);
    } catch (e) {
      await sendMessage(chatId, `❌ Error fetching orders.`);
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
  console.log(`🤖 Bot server running on port ${PORT}`);
});
