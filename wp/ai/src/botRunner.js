#!/usr/bin/env node

require('dotenv').config();
const { startTelegramBot } = require('./telegramBot');

// Check if the Telegram bot token is provided
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error('Error: TELEGRAM_BOT_TOKEN environment variable is not set.');
  console.error('Please set it in your .env file or environment variables.');
  console.error('Example: TELEGRAM_BOT_TOKEN=123456789:ABCdefGhIJKlmnOPQRstUVwxyz');
  process.exit(1);
}

// Start the Telegram bot
const bot = startTelegramBot(process.env.TELEGRAM_BOT_TOKEN);

console.log('MultiversX Warp Generator Telegram Bot is running!');
console.log('Press Ctrl+C to stop the bot.');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Stopping bot...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Stopping bot...');
  bot.stopPolling();
  process.exit(0);
}); 