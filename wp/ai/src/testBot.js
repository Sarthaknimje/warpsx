#!/usr/bin/env node

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// Check if the Telegram bot token is provided
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error('Error: TELEGRAM_BOT_TOKEN environment variable is not set.');
  process.exit(1);
}

// Create a bot instance
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

// Function to send a test message
async function sendTestMessage() {
  try {
    // Replace with your chat ID
    const chatId = process.argv[2];
    
    if (!chatId) {
      console.error('Error: Please provide a chat ID as a command line argument.');
      console.error('Usage: node testBot.js CHAT_ID');
      process.exit(1);
    }
    
    console.log(`Sending test message to chat ID: ${chatId}`);
    
    // Send a message
    const result = await bot.sendMessage(chatId, 'This is a test message from the MultiversX Warp Generator Bot. If you see this, the bot is working correctly!');
    
    console.log('Message sent successfully:', result);
    process.exit(0);
  } catch (error) {
    console.error('Error sending message:', error);
    process.exit(1);
  }
}

// Run the test
sendTestMessage(); 