#!/usr/bin/env node

// Reset Telegram Bot Webhook Settings
const axios = require('axios');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;

async function resetWebhook() {
  try {
    console.log('Deleting any existing webhook...');
    const deleteResponse = await axios.get(
      `https://api.telegram.org/bot${token}/deleteWebhook`
    );
    console.log('Webhook deletion response:', deleteResponse.data);
    
    console.log('Getting webhook info...');
    const infoResponse = await axios.get(
      `https://api.telegram.org/bot${token}/getWebhookInfo`
    );
    console.log('Webhook info:', infoResponse.data);
    
    console.log('Getting bot information...');
    const botInfo = await axios.get(
      `https://api.telegram.org/bot${token}/getMe`
    );
    console.log('Bot info:', botInfo.data);
    
    console.log('Getting updates...');
    const updates = await axios.get(
      `https://api.telegram.org/bot${token}/getUpdates`
    );
    console.log('Updates:', updates.data);
    
    console.log('Bot reset completed successfully!');
  } catch (error) {
    console.error('Error resetting bot:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

resetWebhook(); 