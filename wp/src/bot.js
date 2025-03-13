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
🚀 *Welcome to WarpX Bot!* 🚀

I can help you create MultiversX warps with natural language prompts. Here are some examples of what you can ask me:

*Staking Operations:*
• I want to stake 1 EGLD with Hatom
• I want to stake 2 EGLD with XOXNO
• I want to undelegate my XEGLD tokens from XOXNO

*Query Functions:*
• Check protocol reserves for Hatom
• Show me the rewards reserve for Hatom
• What is the cash reserve for Hatom?

*NFT Operations:*
• I want to buy an NFT on XOXNO with 1 EGLD
• I want to bid 1 EGLD on an NFT on XOXNO
• I want to list my NFT on XOXNO

*Distribution Functions:*
• I want to bulksend EGLD to multiple addresses
• I want to smart send EGLD to multiple addresses

Just send me a message with what you want to do, and I'll generate a warp for you!

For a complete list of available commands, type /help.
`;

  await ctx.replyWithMarkdown(welcomeMessage);
});

// Help command
bot.help(async (ctx) => {
  const helpMessage = `
*WarpX Bot Commands*

/start - Start the bot and see welcome message
/help - Show this help message
/examples - Show example prompts for different operations

*How to create a warp:*
Simply send a message describing what operation you want to perform. 
For example: "I want to stake 1 EGLD with Hatom"

*Supported Operations:*
• Staking with Hatom and XOXNO
• Unstaking from XOXNO
• NFT Marketplace operations (buy, bid, list, etc.)
• Query contract information
• Bulk token transfers

Each warp will be generated with a QR code and a link that you can use to execute the transaction.
`;

  await ctx.replyWithMarkdown(helpMessage);
});

// Examples command
bot.command('examples', async (ctx) => {
  const examplesMessage = `
*Example Prompts for WarpX Bot*

*Staking Examples:*
• "I want to stake 1 EGLD with Hatom"
• "I want to stake 2 EGLD with XOXNO"
• "I want to undelegate my XEGLD tokens from XOXNO"

*Query Examples:*
• "Check protocol reserves for Hatom"
• "Show me the rewards reserve for Hatom"
• "What is the cash reserve for Hatom?"
• "Show me the total withdrawable amount for Hatom"
• "What is the total withdrawn EGLD on XOXNO?"
• "Show me the undelegate token name for Hatom"

*Contract Function Examples:*
• "I want to migrate pending 0.5 EGLD on XOXNO"
• "Add rewards of 1 EGLD to XOXNO"
• "Deposit 0.5 EGLD to XOXNO marketplace"
• "Set undelegate token roles for Hatom"

*NFT Marketplace Examples:*
• "I want to buy an NFT on XOXNO with 1 EGLD"
• "I want to buy swap on XOXNO with 1 EGLD"
• "I want to buy for erd1... an NFT on XOXNO with 1 EGLD"
• "I want to bid 1 EGLD on an NFT on XOXNO"
• "I want to list my NFT on XOXNO"
• "I want to send offer of 1 EGLD for an NFT on XOXNO"

*Distribution Examples:*
• "I want to bulksend EGLD to multiple addresses"
• "I want to bulksend same amount of EGLD to multiple addresses"
• "I want to smart send EGLD to multiple addresses"
• "I want to smart nft send with Remarkable Tools"
`;

  await ctx.replyWithMarkdown(examplesMessage);
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
    const result = await processPrompt(prompt, alias);
    
    if (result && result.success) {
      // Generate QR code
      const qrCodePath = path.join(tempDir, `${alias}.png`);
      await QRCode.toFile(qrCodePath, result.warpLink, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      
      // Create response message
      const successMessage = `
✅ *Warp Generated Successfully!*

*Prompt:* ${prompt}
*Alias:* ${alias}

*Warp Link:* [Click Here](${result.warpLink})
*Explorer Link:* [View on Explorer](${result.explorerLink})

Scan the QR code to use this warp, or click on the link above.
`;
      
      // Send QR code with the message
      await ctx.deleteMessage(processingMsg.message_id);
      await ctx.replyWithPhoto({ source: qrCodePath }, { 
        caption: successMessage,
        parse_mode: 'Markdown'
      });
      
      // Delete the temporary QR code file
      fs.unlinkSync(qrCodePath);
    } else {
      // Handle error
      const errorMessage = result?.error || 'Unknown error occurred';
      const helpfulTips = result?.helpfulTips?.join('\n• ') || '';
      
      const errorResponse = `
❌ *Error Generating Warp*

*Error:* ${errorMessage}
${helpfulTips ? `\n*Helpful Tips:*\n• ${helpfulTips}` : ''}

Please try again with a different prompt or check /examples for guidance.
`;
      
      await ctx.deleteMessage(processingMsg.message_id);
      await ctx.replyWithMarkdown(errorResponse);
    }
  } catch (error) {
    console.error('Bot error:', error);
    
    // Provide a user-friendly error message
    await ctx.replyWithMarkdown(`
❌ *Error*

Sorry, something went wrong while processing your request. Please try again later.

*Technical details:* ${error.message}
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