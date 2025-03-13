/**
 * Telegram Bot for MultiversX Warp Generator
 * This bot allows users to create warps directly from Telegram
 */

require('dotenv').config();
const { Telegraf } = require('telegraf');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { processPrompt } = require('./warpAgent');
const config = require('./configs/config');

// Initialize the bot with the provided token
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '7649255446:AAEUA1DIJ4JGiY258kYg24wYUN15KxvHtPk');
const tempDir = path.join(__dirname, '../temp');

// Create temp directory if it doesn't exist
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Welcome message
bot.start(async (ctx) => {
  const welcomeMessage = `
🚀 <b>Welcome to WarpX Bot!</b> 🚀

I can help you create MultiversX warps with natural language prompts. Here are some examples of what you can ask me:

<b>Staking Operations:</b>
• I want to stake 1 EGLD with Hatom
• I want to stake 2 EGLD with XOXNO
• I want to undelegate my XEGLD tokens from XOXNO

<b>Query Functions:</b>
• Check protocol reserves for Hatom
• Show me the rewards reserve for Hatom
• What is the cash reserve for Hatom?

<b>NFT Operations:</b>
• I want to buy an NFT on XOXNO with 1 EGLD
• I want to bid 1 EGLD on an NFT on XOXNO
• I want to list my NFT on XOXNO

<b>Distribution Functions:</b>
• I want to bulksend EGLD to multiple addresses
• I want to smart send EGLD to multiple addresses

Just send me a message with what you want to do, and I'll generate a warp for you!

For a complete list of available commands, type /help.
`;

  await ctx.replyWithHTML(welcomeMessage);
});

// Help command
bot.help(async (ctx) => {
  const helpMessage = `
<b>WarpX Bot Commands</b>

/start - Start the bot and see welcome message
/help - Show this help message
/examples - Show example prompts for different operations

<b>How to create a warp:</b>
Simply send a message describing what operation you want to perform. 
For example: "I want to stake 1 EGLD with Hatom"

<b>Supported Operations:</b>
• Staking with Hatom and XOXNO
• Unstaking from XOXNO
• NFT Marketplace operations (buy, bid, list, etc.)
• Query contract information
• Bulk token transfers

Each warp will be generated with a QR code and a link that you can use to execute the transaction.
`;

  await ctx.replyWithHTML(helpMessage);
});

// Examples command
bot.command('examples', async (ctx) => {
  const examplesMessage = `
<b>Example Prompts for WarpX Bot</b>

<b>Staking Examples:</b>
• "I want to stake 1 EGLD with Hatom"
• "I want to stake 2 EGLD with XOXNO"
• "I want to undelegate my XEGLD tokens from XOXNO"

<b>Query Examples:</b>
• "Check protocol reserves for Hatom"
• "Show me the rewards reserve for Hatom"
• "What is the cash reserve for Hatom?"
• "Show me the total withdrawable amount for Hatom"
• "What is the total withdrawn EGLD on XOXNO?"
• "Show me the undelegate token name for Hatom"

<b>Contract Function Examples:</b>
• "I want to migrate pending 0.5 EGLD on XOXNO"
• "Add rewards of 1 EGLD to XOXNO"
• "Deposit 0.5 EGLD to XOXNO marketplace"
• "Set undelegate token roles for Hatom"

<b>NFT Marketplace Examples:</b>
• "I want to buy an NFT on XOXNO with 1 EGLD"
• "I want to buy swap on XOXNO with 1 EGLD"
• "I want to buy for erd1... an NFT on XOXNO with 1 EGLD"
• "I want to bid 1 EGLD on an NFT on XOXNO"
• "I want to list my NFT on XOXNO"
• "I want to send offer of 1 EGLD for an NFT on XOXNO"

<b>Distribution Examples:</b>
• "I want to bulksend EGLD to multiple addresses"
• "I want to bulksend same amount of EGLD to multiple addresses"
• "I want to smart send EGLD to multiple addresses"
• "I want to smart nft send with Remarkable Tools"
`;

  await ctx.replyWithHTML(examplesMessage);
});

// Process all text messages as prompts for warp generation
bot.on('text', async (ctx) => {
  const prompt = ctx.message.text;
  
  // Skip processing of commands
  if (prompt.startsWith('/')) return;
  
  // Show typing indicator to the user
  await ctx.replyWithChatAction('typing');
  
  try {
    // Generate a unique alias based on username and timestamp
    const username = ctx.message.from.username || `user${ctx.message.from.id}`;
    const timestamp = Date.now();
    const alias = `tg-${username}-${timestamp}`;
    
    // Send initial processing message
    const processingMsg = await ctx.reply('🔄 Processing your request...');
    
    // Process the prompt to generate a warp
    try {
      const result = await processPrompt(prompt, alias);
      
      // Generate QR code using the warp link format from the result
      const qrCodePath = path.join(tempDir, `${alias}.png`);
      const warpLink = `https://devnet.usewarp.to/hash%3A${result.txHash}`;
      const explorerLink = `https://devnet-explorer.multiversx.com/transactions/${result.txHash}`;
      
      await QRCode.toFile(qrCodePath, warpLink, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      
      // Create response message with proper Telegram markdown
      const successMessage = `
✅ *Warp Generated Successfully!*

*Prompt:* ${prompt}
*Alias:* ${alias}

*Warp Link:* [Click Here](${warpLink})
*Explorer Link:* [View on Explorer](${explorerLink})

Scan the QR code to use this warp, or click on the link above.
`;
      
      // Send QR code with the message - using HTML parse mode for more reliable link rendering
      await ctx.deleteMessage(processingMsg.message_id);
      await ctx.replyWithPhoto({ source: qrCodePath }, { 
        caption: `
✅ <b>Warp Generated Successfully!</b>

<b>Prompt:</b> ${prompt}
<b>Alias:</b> ${alias}

<b>Warp Link:</b> <a href="${warpLink}">Click Here</a>
<b>Explorer Link:</b> <a href="${explorerLink}">View on Explorer</a>

Scan the QR code to use this warp, or click on the links above.
`,
        parse_mode: 'HTML'
      });
      
      // Delete the temporary QR code file
      fs.unlinkSync(qrCodePath);
    } catch (error) {
      console.error('Error processing prompt:', error);
      
      // Handle error
      const errorMessage = error.message || 'Unknown error occurred';
      
      const errorResponse = `
❌ <b>Error Generating Warp</b>

<b>Error:</b> ${errorMessage}

Please try again with a different prompt or check /examples for guidance.
`;
      
      await ctx.deleteMessage(processingMsg.message_id);
      await ctx.replyWithHTML(errorResponse);
    }
  } catch (generalError) {
    console.error('Bot error:', generalError);
    
    // Provide a user-friendly error message
    await ctx.replyWithHTML(`
❌ <b>Error</b>

Sorry, something went wrong while processing your request. Please try again later.

<b>Technical details:</b> ${generalError.message}
`);
  }
});

// Error handling
bot.catch((err, ctx) => {
  console.error(`Bot error for ${ctx.updateType}`, err);
});

// Launch the bot
bot.launch()
  .then(() => {
    console.log('✅ WarpX Telegram Bot is running');
    console.log(`Bot username: @${bot.botInfo?.username || 'WarpX_bot'}`);
  })
  .catch(err => {
    console.error('Failed to start bot:', err);
  });

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = bot; 