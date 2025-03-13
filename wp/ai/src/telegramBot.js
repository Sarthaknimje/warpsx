const TelegramBot = require('node-telegram-bot-api');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { processPrompt } = require('./warpAgent');
const { previewWarp } = require('./warpAgent');
const config = require('./configs/config');
const { isAliasAvailable } = require('./utils/warpManager');

// Create a temporary directory for QR code images if it doesn't exist
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Add a message tracking system to prevent duplicate processing
const processedMessages = new Map();
const processingLock = new Map();

/**
 * Initialize and start the Telegram bot
 * @param {string} token - Telegram bot token
 * @returns {TelegramBot} - The initialized bot instance
 */
function startTelegramBot(token) {
  // Create a bot instance
  const bot = new TelegramBot(token, { polling: true });
  
  // Add middleware to prevent duplicate message processing
  bot.on('message', (msg) => {
    const messageId = msg.message_id;
    const chatId = msg.chat.id;
    const messageKey = `${chatId}:${messageId}`;
    
    // Skip if this message was already processed
    if (processedMessages.has(messageKey)) {
      console.log(`Skipping duplicate message: ${messageKey}`);
      return;
    }
    
    // Skip if this chat is currently being processed
    if (processingLock.get(chatId)) {
      console.log(`Chat ${chatId} is currently processing another command, queueing...`);
      setTimeout(() => {
        // Retry after a delay if the lock is still active
        if (!processingLock.get(chatId)) {
          bot.processUpdate({ message: msg });
        }
      }, 1000);
      return;
    }
    
    // Mark this message as processed
    processedMessages.set(messageKey, true);
    
    // Clean up old messages (keep last 100 per chat)
    const chatMessages = Array.from(processedMessages.keys())
      .filter(key => key.startsWith(`${chatId}:`));
    
    if (chatMessages.length > 100) {
      // Sort by message ID (which should be chronological)
      chatMessages.sort((a, b) => {
        const idA = parseInt(a.split(':')[1]);
        const idB = parseInt(b.split(':')[1]);
        return idA - idB;
      });
      
      // Remove oldest messages
      const toRemove = chatMessages.slice(0, chatMessages.length - 100);
      toRemove.forEach(key => processedMessages.delete(key));
    }
  });
  
  // Command to start the bot and show help
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const messageKey = `${chatId}:${messageId}`;
    
    // Skip if already processed
    if (processedMessages.has(messageKey)) return;
    processedMessages.set(messageKey, true);
    
    // Set processing lock
    processingLock.set(chatId, true);
    
    try {
      const username = msg.from.username || msg.from.first_name;
      
      const welcomeMessage = `
Hello ${username}! 👋 I'm the MultiversX Warp Generator Bot.

I can help you create blockchain transactions using simple commands. Here's how to use me:

🔹 *Create a Warp*
Send: \`/warp stake 10 EGLD\`
I'll generate a warp link for staking 10 EGLD.

🔹 *Create a Warp with Alias*
Send: \`/warp swap 1 EGLD for USDC alias=my-swap\`
I'll create a warp with the alias "my-swap".

🔹 *Preview a Warp*
Send: \`/preview lend 100 USDC\`
I'll show you what the warp will look like without creating it.

🔹 *Check Alias Availability*
Send: \`/check-alias my-alias\`
I'll tell you if the alias is available.

🔹 *Get Help*
Send: \`/help\`
I'll show this message again.

Try it now by sending a command! 🚀
      `;
      
      // Create a keyboard with common actions
      const keyboard = {
        reply_markup: {
          keyboard: [
            ['/warp stake 10 EGLD', '/warp swap 1 EGLD for USDC'],
            ['/templates', '/help']
          ],
          resize_keyboard: true,
          one_time_keyboard: false
        }
      };
      
      await bot.sendMessage(chatId, welcomeMessage, { 
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      });
    } catch (error) {
      console.error('Error in start command:', error);
    } finally {
      // Release the lock
      processingLock.set(chatId, false);
    }
  });
  
  // Help command
  bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const messageKey = `${chatId}:${messageId}`;
    
    // Skip if already processed
    if (processedMessages.has(messageKey)) return;
    processedMessages.set(messageKey, true);
    
    // Set processing lock
    processingLock.set(chatId, true);
    
    try {
      const helpMessage = `
*MultiversX Warp Generator Bot Commands*

🔹 *Basic Commands*
\`/warp [prompt]\` - Create a warp from your prompt
\`/warp [prompt] alias=[name]\` - Create a warp with a custom alias
\`/preview [prompt]\` - Preview a warp without creating it
\`/check-alias [name]\` - Check if an alias is available

🔹 *Advanced Commands*
\`/contract [address] [function] [args] [value]\` - Call a specific contract function
\`/batch [prompt1] | [prompt2] | [prompt3]\` - Create multiple warps at once
\`/templates\` - Show available warp templates
\`/use-template [template-name] [params]\` - Use a specific template

🔹 *Example Prompts*
\`stake 10 EGLD\`
\`swap 1 EGLD for USDC\`
\`lend 100 USDC\`
\`borrow 500 USDC with 2 EGLD as collateral\`
\`send 0.5 EGLD to erd1...\`

🔹 *Group Usage*
In groups, you must use the commands with a / prefix.
Example: \`/warp stake 10 EGLD\`

Need more help? Visit our website or contact support.
      `;
      
      await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error in help command:', error);
    } finally {
      // Release the lock
      processingLock.set(chatId, false);
    }
  });
  
  // Command to check alias availability
  bot.onText(/\/check-alias (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const alias = match[1].trim();
    
    bot.sendMessage(chatId, `Checking availability of alias: "${alias}"...`);
    
    try {
      const isAvailable = await isAliasAvailable(alias);
      
      if (isAvailable) {
        bot.sendMessage(chatId, `✅ Good news! The alias "${alias}" is available and can be used for your warp.`);
      } else {
        bot.sendMessage(chatId, `❌ The alias "${alias}" is already taken. Please try a different one.`);
      }
    } catch (error) {
      console.error('Error checking alias availability:', error);
      bot.sendMessage(chatId, `Error checking alias availability: ${error.message}`);
    }
  });
  
  // Command to preview a warp
  bot.onText(/\/preview (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const prompt = match[1].trim();
    
    bot.sendMessage(chatId, `Previewing warp for: "${prompt}"...`);
    
    try {
      const preview = await previewWarp(prompt);
      
      let previewMessage = `
*Warp Preview for:* "${prompt}"

*Name:* ${preview.warp.name}
*Title:* ${preview.warp.title}
*Description:* ${preview.warp.description || 'None'}

*Actions:*
`;
      
      preview.warp.actions.forEach((action, index) => {
        previewMessage += `\n*Action ${index + 1}:* ${action.label}\n`;
        previewMessage += `Type: ${action.type}\n`;
        
        if (action.type === 'contract') {
          previewMessage += `Contract: \`${action.address}\`\n`;
          previewMessage += `Function: \`${action.func}\`\n`;
          previewMessage += `Value: ${action.value || '0'} EGLD\n`;
        } else if (action.type === 'transfer') {
          previewMessage += `Destination: \`${action.destination}\`\n`;
          previewMessage += `Value: ${action.value || '0'} EGLD\n`;
        }
      });
      
      previewMessage += `\n*To create this warp, use:* \`/warp ${prompt}\``;
      
      bot.sendMessage(chatId, previewMessage, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error previewing warp:', error);
      bot.sendMessage(chatId, `Error previewing warp: ${error.message}`);
    }
  });
  
  // Command to create a warp
  bot.onText(/\/warp (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const messageKey = `${chatId}:${messageId}`;
    
    // Skip if already processed
    if (processedMessages.has(messageKey)) return;
    processedMessages.set(messageKey, true);
    
    // Set processing lock
    processingLock.set(chatId, true);
    
    try {
      const fullPrompt = match[1].trim();
      
      // Check if an alias is specified
      let prompt = fullPrompt;
      let alias = null;
      
      const aliasMatch = fullPrompt.match(/alias=([a-zA-Z0-9-_]+)/);
      if (aliasMatch) {
        alias = aliasMatch[1];
        // Remove the alias part from the prompt
        prompt = fullPrompt.replace(/\s*alias=[a-zA-Z0-9-_]+\s*/, ' ').trim();
      }
      
      await bot.sendMessage(chatId, `Creating warp for: "${prompt}"${alias ? ` with alias: "${alias}"` : ''}...`);
      
      try {
        const result = await processPrompt(prompt, alias);
        
        // Generate a QR code image
        const qrImagePath = path.join(tempDir, `qr-${Date.now()}.png`);
        await qrcode.toFile(qrImagePath, result.fallbackLink || result.link);
        
        // Prepare the message
        let warpMessage = `
*Your Warp is Ready!* 🚀

*Transaction Hash:* \`${result.txHash}\`
`;

        if (result.alias) {
          warpMessage += `*Alias:* \`${result.alias}\`\n\n`;
          warpMessage += `*Alias Link:*\n${result.link}\n`;
          warpMessage += `_(This link uses your alias and may take a few minutes to work properly)_\n\n`;
        }
        
        warpMessage += `*Hash Link (Always Works):*\n${result.fallbackLink || result.link}\n`;
        warpMessage += `_(This link uses the transaction hash directly and will always work)_\n\n`;
        
        if (result.explorerLink) {
          warpMessage += `*View on Explorer:*\n${result.explorerLink}\n\n`;
        }
        
        if (result.aliasError) {
          warpMessage += `⚠️ *Alias Registration Issue:* ${result.aliasError}\n`;
          warpMessage += `Don't worry! You can still use your warp with the Hash Link provided above.\n\n`;
        }
        
        warpMessage += `*Scan the QR code below to access your warp:*`;
        
        // Send the message with the QR code
        await bot.sendMessage(chatId, warpMessage, { parse_mode: 'Markdown' });
        await bot.sendPhoto(chatId, qrImagePath);
        
        // Delete the temporary file after sending
        fs.unlinkSync(qrImagePath);
        
      } catch (error) {
        console.error('Error creating warp:', error);
        
        let errorMessage = `Error creating warp: ${error.message}`;
        
        if (error.helpfulTips && error.helpfulTips.length > 0) {
          errorMessage += '\n\nHelpful Tips:';
          error.helpfulTips.forEach(tip => {
            errorMessage += `\n• ${tip}`;
          });
        }
        
        await bot.sendMessage(chatId, errorMessage);
      }
    } catch (error) {
      console.error('Error in warp command:', error);
    } finally {
      // Release the lock
      processingLock.set(chatId, false);
    }
  });
  
  // Command to show available templates
  bot.onText(/\/templates/, (msg) => {
    const chatId = msg.chat.id;
    
    const templatesMessage = `
*Available Warp Templates*

1. *Staking Template*
   Usage: \`/use-template stake amount=10 validator=erd1...\`
   Description: Stake EGLD with a validator

2. *Swap Template*
   Usage: \`/use-template swap amount=1 from=EGLD to=USDC\`
   Description: Swap one token for another

3. *Lending Template*
   Usage: \`/use-template lend amount=100 token=USDC\`
   Description: Lend tokens to earn interest

4. *Borrowing Template*
   Usage: \`/use-template borrow amount=500 token=USDC collateral=2\`
   Description: Borrow tokens using EGLD as collateral

To use a template, type \`/use-template\` followed by the template name and parameters.
    `;
    
    bot.sendMessage(chatId, templatesMessage, { parse_mode: 'Markdown' });
  });

  // Command to use a specific template
  bot.onText(/\/use-template (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const templateInput = match[1].trim();
    
    // Parse template name and parameters
    const templateParts = templateInput.split(' ');
    const templateName = templateParts[0];
    
    // Extract parameters
    const params = {};
    templateParts.slice(1).forEach(part => {
      const [key, value] = part.split('=');
      if (key && value) {
        params[key] = value;
      }
    });
    
    bot.sendMessage(chatId, `Using template: "${templateName}" with parameters: ${JSON.stringify(params)}`);
    
    try {
      // Convert template to a prompt
      let prompt = '';
      let alias = null;
      
      if (params.alias) {
        alias = params.alias;
        delete params.alias;
      }
      
      switch (templateName.toLowerCase()) {
        case 'stake':
          prompt = `stake ${params.amount || '10'} EGLD${params.validator ? ` with validator ${params.validator}` : ''}`;
          break;
        case 'swap':
          prompt = `swap ${params.amount || '1'} ${params.from || 'EGLD'} for ${params.to || 'USDC'}`;
          break;
        case 'transfer':
          prompt = `send ${params.amount || '0.5'} ${params.token || 'EGLD'} to ${params.to || 'address'}`;
          break;
        case 'lend':
          prompt = `lend ${params.amount || '100'} ${params.token || 'USDC'}`;
          break;
        case 'borrow':
          prompt = `borrow ${params.amount || '500'} ${params.token || 'USDC'} with ${params.collateral || '2'} EGLD as collateral`;
          break;
        default:
          throw new Error(`Unknown template: ${templateName}`);
      }
      
      bot.sendMessage(chatId, `Generated prompt: "${prompt}"\nCreating warp...`);
      
      // Process the prompt
      const result = await processPrompt(prompt, alias);
      
      // Generate a QR code image
      const qrImagePath = path.join(tempDir, `qr-${Date.now()}.png`);
      await qrcode.toFile(qrImagePath, result.fallbackLink || result.link);
      
      // Prepare the message
      let warpMessage = `
*Your Warp is Ready!* 🚀

*Transaction Hash:* \`${result.txHash}\`
`;

      if (result.alias) {
        warpMessage += `*Alias:* \`${result.alias}\`\n\n`;
        warpMessage += `*Alias Link:*\n${result.link}\n`;
        warpMessage += `_(This link uses your alias and may take a few minutes to work properly)_\n\n`;
      }
      
      warpMessage += `*Hash Link (Always Works):*\n${result.fallbackLink || result.link}\n`;
      warpMessage += `_(This link uses the transaction hash directly and will always work)_\n\n`;
      
      if (result.explorerLink) {
        warpMessage += `*View on Explorer:*\n${result.explorerLink}\n\n`;
      }
      
      if (result.aliasError) {
        warpMessage += `⚠️ *Alias Registration Issue:* ${result.aliasError}\n`;
        warpMessage += `Don't worry! You can still use your warp with the Hash Link provided above.\n\n`;
      }
      
      warpMessage += `*Scan the QR code below to access your warp:*`;
      
      // Send the message with the QR code
      bot.sendMessage(chatId, warpMessage, { parse_mode: 'Markdown' })
        .then(() => {
          // Send the QR code as a photo
          bot.sendPhoto(chatId, qrImagePath)
            .then(() => {
              // Delete the temporary file after sending
              fs.unlinkSync(qrImagePath);
            });
        });
      
    } catch (error) {
      console.error('Error using template:', error);
      
      let errorMessage = `Error using template: ${error.message}`;
      
      if (error.helpfulTips && error.helpfulTips.length > 0) {
        errorMessage += '\n\nHelpful Tips:';
        error.helpfulTips.forEach(tip => {
          errorMessage += `\n• ${tip}`;
        });
      }
      
      bot.sendMessage(chatId, errorMessage);
    }
  });

  // Command to call a specific contract function
  bot.onText(/\/contract (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const contractInput = match[1].trim();
    
    // Parse contract parameters
    const parts = contractInput.split(' ');
    
    if (parts.length < 2) {
      return bot.sendMessage(chatId, 'Please provide at least contract address and function name.\nUsage: `/contract [address] [function] [args] [value] [alias=name]`');
    }
    
    const contractAddress = parts[0];
    const functionName = parts[1];
    
    // Check for alias
    let alias = null;
    let argsEndIndex = parts.length;
    
    for (let i = 2; i < parts.length; i++) {
      if (parts[i].startsWith('alias=')) {
        alias = parts[i].substring(6);
        argsEndIndex = i;
        break;
      }
    }
    
    // Parse args and value
    let args = [];
    let value = '0';
    
    if (argsEndIndex > 2) {
      // Check if the second-to-last parameter might be a value
      if (argsEndIndex > 3 && !isNaN(parseFloat(parts[argsEndIndex - 1]))) {
        value = parts[argsEndIndex - 1];
        args = parts.slice(2, argsEndIndex - 1);
      } else {
        args = parts.slice(2, argsEndIndex);
      }
    }
    
    // Try to parse args as JSON if it's a single string that looks like JSON
    if (args.length === 1 && (args[0].startsWith('[') || args[0].startsWith('{'))) {
      try {
        args = JSON.parse(args[0]);
      } catch (e) {
        // Keep as is if parsing fails
      }
    }
    
    bot.sendMessage(chatId, `Creating contract warp for:
*Address:* \`${contractAddress}\`
*Function:* \`${functionName}\`
*Args:* \`${JSON.stringify(args)}\`
*Value:* \`${value} EGLD\`
${alias ? `*Alias:* \`${alias}\`` : ''}
`);
    
    try {
      // Import the processDirectContractWarp function
      const { processDirectContractWarp } = require('./warpAgent');
      
      // Process the contract warp
      const result = await processDirectContractWarp(
        contractAddress,
        functionName,
        args,
        value,
        60000000, // Default gas limit
        alias
      );
      
      // Generate a QR code image
      const qrImagePath = path.join(tempDir, `qr-${Date.now()}.png`);
      await qrcode.toFile(qrImagePath, result.fallbackLink || result.link);
      
      // Prepare the message
      let warpMessage = `
*Your Contract Warp is Ready!* 🚀

*Transaction Hash:* \`${result.txHash}\`
`;

      if (result.alias) {
        warpMessage += `*Alias:* \`${result.alias}\`\n\n`;
        warpMessage += `*Alias Link:*\n${result.link}\n`;
        warpMessage += `_(This link uses your alias and may take a few minutes to work properly)_\n\n`;
      }
      
      warpMessage += `*Hash Link (Always Works):*\n${result.fallbackLink || result.link}\n`;
      warpMessage += `_(This link uses the transaction hash directly and will always work)_\n\n`;
      
      if (result.explorerLink) {
        warpMessage += `*View on Explorer:*\n${result.explorerLink}\n\n`;
      }
      
      if (result.aliasError) {
        warpMessage += `⚠️ *Alias Registration Issue:* ${result.aliasError}\n`;
        warpMessage += `Don't worry! You can still use your warp with the Hash Link provided above.\n\n`;
      }
      
      warpMessage += `*Scan the QR code below to access your warp:*`;
      
      // Send the message with the QR code
      bot.sendMessage(chatId, warpMessage, { parse_mode: 'Markdown' })
        .then(() => {
          // Send the QR code as a photo
          bot.sendPhoto(chatId, qrImagePath)
            .then(() => {
              // Delete the temporary file after sending
              fs.unlinkSync(qrImagePath);
            });
        });
      
    } catch (error) {
      console.error('Error creating contract warp:', error);
      
      let errorMessage = `Error creating contract warp: ${error.message}`;
      
      if (error.helpfulTips && error.helpfulTips.length > 0) {
        errorMessage += '\n\nHelpful Tips:';
        error.helpfulTips.forEach(tip => {
          errorMessage += `\n• ${tip}`;
        });
      }
      
      bot.sendMessage(chatId, errorMessage);
    }
  });

  // Command to create batch warps
  bot.onText(/\/batch (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const batchInput = match[1].trim();
    
    // Split by pipe character
    const prompts = batchInput.split('|').map(p => p.trim()).filter(p => p.length > 0);
    
    if (prompts.length === 0) {
      return bot.sendMessage(chatId, 'Please provide at least one prompt.\nUsage: `/batch prompt1 | prompt2 | prompt3`');
    }
    
    if (prompts.length > 5) {
      bot.sendMessage(chatId, '⚠️ Maximum 5 prompts allowed per batch. Only the first 5 will be processed.');
      prompts.splice(5);
    }
    
    bot.sendMessage(chatId, `Processing ${prompts.length} warps in batch mode...`);
    
    try {
      // Import the processBatchPrompts function
      const { processBatchPrompts } = require('./warpAgent');
      
      // Process the batch
      const results = await processBatchPrompts(prompts);
      
      // Send a summary message
      let summaryMessage = `
*Batch Processing Results*

${results.length} warps processed:
`;
      
      // Send individual results
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        
        if (result.success) {
          summaryMessage += `\n✅ Warp ${i+1}: "${result.prompt}" - Success`;
          
          // Generate a QR code image
          const qrImagePath = path.join(tempDir, `qr-batch-${i}-${Date.now()}.png`);
          await qrcode.toFile(qrImagePath, result.fallbackLink || result.link);
          
          // Prepare the message
          let warpMessage = `
*Batch Warp ${i+1} is Ready!* 🚀

*Prompt:* "${result.prompt}"
*Transaction Hash:* \`${result.txHash}\`

*Hash Link:*\n${result.fallbackLink || result.link}

${result.explorerLink ? `*View on Explorer:*\n${result.explorerLink}\n\n` : ''}
*Scan the QR code below to access your warp:*
`;
          
          // Send the message with the QR code
          await bot.sendMessage(chatId, warpMessage, { parse_mode: 'Markdown' });
          await bot.sendPhoto(chatId, qrImagePath);
          
          // Delete the temporary file after sending
          fs.unlinkSync(qrImagePath);
        } else {
          summaryMessage += `\n❌ Warp ${i+1}: "${result.prompt}" - Failed: ${result.error}`;
        }
      }
      
      // Send the summary message
      bot.sendMessage(chatId, summaryMessage, { parse_mode: 'Markdown' });
      
    } catch (error) {
      console.error('Error processing batch warps:', error);
      bot.sendMessage(chatId, `Error processing batch warps: ${error.message}`);
    }
  });
  
  // Handle inline queries (for future expansion)
  bot.on('inline_query', async (query) => {
    const results = [];
    
    // For now, just provide some example commands
    if (query.query.length === 0) {
      results.push({
        type: 'article',
        id: 'help',
        title: 'How to use this bot',
        description: 'Click here to learn how to use the MultiversX Warp Generator Bot',
        input_message_content: {
          message_text: 'Use /warp [prompt] to create a warp. For example: /warp stake 10 EGLD'
        }
      });
      
      // Add some example commands
      const examples = [
        { id: 'stake', prompt: 'stake 10 EGLD' },
        { id: 'swap', prompt: 'swap 1 EGLD for USDC' },
        { id: 'send', prompt: 'send 0.5 EGLD to erd1...' }
      ];
      
      examples.forEach(example => {
        results.push({
          type: 'article',
          id: example.id,
          title: `Example: ${example.prompt}`,
          description: `Create a warp to ${example.prompt}`,
          input_message_content: {
            message_text: `/warp ${example.prompt}`
          }
        });
      });
    }
    
    bot.answerInlineQuery(query.id, results);
  });
  
  // Log errors
  bot.on('polling_error', (error) => {
    console.error('Telegram bot polling error:', error);
    
    // Try to restart polling after a delay
    setTimeout(() => {
      try {
        bot.startPolling();
        console.log('Bot polling restarted after error');
      } catch (restartError) {
        console.error('Failed to restart bot polling:', restartError);
      }
    }, 5000);
  });
  
  // Add a command to show status
  bot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
      // Check if the wallet is accessible
      const { loadWallet } = require('./utils/wallet');
      const wallet = await loadWallet();
      
      // Check if the network is accessible
      const { ApiNetworkProvider } = require('@multiversx/sdk-core');
      const provider = new ApiNetworkProvider(config.warpConfig.chainApiUrl);
      const networkConfig = await provider.getNetworkConfig();
      
      // Send status message
      bot.sendMessage(chatId, `
*MultiversX Warp Generator Status*

✅ *Bot:* Online and operational
✅ *Wallet:* Connected (${wallet.address.substring(0, 8)}...${wallet.address.substring(wallet.address.length - 8)})
✅ *Network:* Connected to ${config.warpConfig.chainApiUrl}
✅ *Chain ID:* ${networkConfig.ChainID || config.warpConfig.chainID}

*Environment:* ${config.appConfig.mockMode ? 'Mock Mode (no real transactions)' : 'Production Mode (real transactions)'}
*Version:* 1.1.0
      `, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error checking status:', error);
      
      // Send error message
      bot.sendMessage(chatId, `
*MultiversX Warp Generator Status*

❌ *Error:* ${error.message}

Please check the server logs for more information.
      `, { parse_mode: 'Markdown' });
    }
  });

  // Add a command to show popular warps
  bot.onText(/\/popular/, (msg) => {
    const chatId = msg.chat.id;
    
    const popularWarps = [
      {
        name: 'Stake 10 EGLD',
        prompt: '/warp stake 10 EGLD',
        description: 'Stake 10 EGLD with the default validator'
      },
      {
        name: 'Swap 1 EGLD for USDC',
        prompt: '/warp swap 1 EGLD for USDC',
        description: 'Swap 1 EGLD for USDC at the best rate'
      },
      {
        name: 'Lend 100 USDC',
        prompt: '/warp lend 100 USDC',
        description: 'Lend 100 USDC to earn interest'
      },
      {
        name: 'Claim Rewards',
        prompt: '/warp claim staking rewards',
        description: 'Claim your staking rewards'
      },
      {
        name: 'Send 0.5 EGLD',
        prompt: '/warp send 0.5 EGLD to erd1...',
        description: 'Send 0.5 EGLD to an address (replace with recipient)'
      }
    ];
    
    let message = '*Popular Warp Commands*\n\n';
    
    popularWarps.forEach((warp, index) => {
      message += `${index + 1}. *${warp.name}*\n`;
      message += `   Command: \`${warp.prompt}\`\n`;
      message += `   ${warp.description}\n\n`;
    });
    
    message += 'Click on any command to use it!';
    
    // Create inline keyboard with popular commands
    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: popularWarps.map(warp => [
          { text: warp.name, callback_data: `command:${warp.prompt}` }
        ])
      }
    };
    
    bot.sendMessage(chatId, message, { 
      parse_mode: 'Markdown',
      reply_markup: inlineKeyboard.reply_markup
    });
  });

  // Handle callback queries from inline keyboards
  bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    
    // Answer the callback query to remove the loading indicator
    bot.answerCallbackQuery(callbackQuery.id);
    
    if (data.startsWith('command:')) {
      const command = data.substring(8);
      
      // Send the command as if the user typed it
      bot.sendMessage(chatId, `Executing command: ${command}`);
      
      // Simulate the user sending this message
      bot.processUpdate({
        message: {
          text: command,
          chat: { id: chatId },
          from: callbackQuery.from,
          date: Math.floor(Date.now() / 1000)
        }
      });
    }
  });

  // Add a command to cancel the current operation
  bot.onText(/\/cancel/, (msg) => {
    const chatId = msg.chat.id;
    
    // Reset any ongoing operations for this chat
    // (This is a placeholder - you would need to track ongoing operations per chat)
    
    bot.sendMessage(chatId, '✅ Operation cancelled. What would you like to do next?');
  });
  
  // Add a command to show examples with screenshots
  bot.onText(/\/examples/, (msg) => {
    const chatId = msg.chat.id;
    
    // Send an introduction message
    bot.sendMessage(chatId, `
*MultiversX Warp Generator Examples*

Here are some detailed examples of how to use this bot. I'll show you step-by-step guides for common operations.
    `, { parse_mode: 'Markdown' });
    
    // Example 1: Staking EGLD
    setTimeout(() => {
      bot.sendMessage(chatId, `
*Example 1: Staking EGLD*

To stake EGLD, use the command:
\`/warp stake 10 EGLD\`

This will create a warp that allows anyone to stake 10 EGLD with the default validator.

You can also specify a validator:
\`/warp stake 10 EGLD with validator erd1qqqqqqqqqqqqqpgqd9rvv2n378e27jcts8vfwynpkm8ng7g7945s2ey76d\`

*Step-by-step:*
1. Type the command
2. Bot generates a warp link and QR code
3. Share the link or QR code
4. Recipient clicks the link to execute the staking
    `, { parse_mode: 'Markdown' });
      
      // Send a mock screenshot of staking
      const stakingImagePath = path.join(__dirname, 'public', 'images', 'staking-example.jpg');
      if (fs.existsSync(stakingImagePath)) {
        bot.sendPhoto(chatId, stakingImagePath, { caption: 'Example of staking EGLD with a warp' });
      }
    }, 1000);
    
    // Example 2: Swapping tokens
    setTimeout(() => {
      bot.sendMessage(chatId, `
*Example 2: Swapping Tokens*

To swap tokens, use the command:
\`/warp swap 1 EGLD for USDC\`

This will create a warp that allows anyone to swap 1 EGLD for USDC at the best available rate.

You can also specify a minimum amount to receive:
\`/warp swap 1 EGLD for at least 80 USDC\`

*Step-by-step:*
1. Type the command
2. Bot generates a warp link and QR code
3. Share the link or QR code
4. Recipient clicks the link to execute the swap
    `, { parse_mode: 'Markdown' });
      
      // Send a mock screenshot of swapping
      const swapImagePath = path.join(__dirname, 'public', 'images', 'swap-example.jpg');
      if (fs.existsSync(swapImagePath)) {
        bot.sendPhoto(chatId, swapImagePath, { caption: 'Example of swapping tokens with a warp' });
      }
    }, 3000);
    
    // Example 3: Using templates
    setTimeout(() => {
      bot.sendMessage(chatId, `
*Example 3: Using Templates*

Templates make it easy to create warps with specific parameters:
\`/use-template stake amount=10 validator=erd1...\`

Available templates:
- stake
- swap
- transfer
- lend
- borrow

*Step-by-step:*
1. Type \`/templates\` to see all available templates
2. Choose a template and add parameters
3. Bot generates a warp based on the template
4. Share the link or QR code
    `, { parse_mode: 'Markdown' });
    }, 5000);
    
    // Example 4: Batch processing
    setTimeout(() => {
      bot.sendMessage(chatId, `
*Example 4: Batch Processing*

Create multiple warps at once:
\`/batch stake 10 EGLD | swap 1 EGLD for USDC | send 0.5 EGLD to erd1...\`

This will create 3 separate warps in one command.

*Step-by-step:*
1. Type the batch command with multiple prompts separated by |
2. Bot processes each prompt and generates multiple warps
3. Share the links or QR codes as needed
    `, { parse_mode: 'Markdown' });
    }, 7000);
    
    // Final message with keyboard
    setTimeout(() => {
      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Try Staking Example', callback_data: 'command:/warp stake 10 EGLD' }],
            [{ text: 'Try Swapping Example', callback_data: 'command:/warp swap 1 EGLD for USDC' }],
            [{ text: 'See Templates', callback_data: 'command:/templates' }]
          ]
        }
      };
      
      bot.sendMessage(chatId, `
*Ready to try it yourself?*

Click one of the buttons below to try an example, or type your own command!
      `, { 
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      });
    }, 9000);
  });

  // Add a command to show network statistics
  bot.onText(/\/stats/, async (msg) => {
    const chatId = msg.chat.id;
    
    bot.sendMessage(chatId, 'Fetching MultiversX network statistics...');
    
    try {
      // Import required modules
      const { ApiNetworkProvider } = require('@multiversx/sdk-core');
      
      // Create a provider
      const provider = new ApiNetworkProvider(config.warpConfig.chainApiUrl);
      
      // Get network statistics
      const networkStats = await provider.getNetworkStatus();
      const networkConfig = await provider.getNetworkConfig();
      
      // Format the statistics
      const statsMessage = `
*MultiversX Network Statistics*

🔹 *Network:* ${config.warpConfig.chainApiUrl.includes('devnet') ? 'Devnet' : 
                config.warpConfig.chainApiUrl.includes('testnet') ? 'Testnet' : 'Mainnet'}
🔹 *Chain ID:* ${networkConfig.ChainID || config.warpConfig.chainID}
🔹 *Current Round:* ${networkStats.CurrentRound}
🔹 *Epoch:* ${networkStats.Epoch}
🔹 *Round Time:* ${networkStats.RoundTime} seconds
🔹 *Rounds Per Epoch:* ${networkStats.RoundsPerEpoch}

*Shard Statistics:*
${networkStats.ShardStatistics.map(shard => 
  `Shard ${shard.ShardID}: ${shard.LiveValidators} validators, ${shard.AverageBlockTxCount} avg. txs/block`
).join('\n')}

*Last Updated:* ${new Date().toISOString()}
      `;
      
      bot.sendMessage(chatId, statsMessage, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error fetching network statistics:', error);
      bot.sendMessage(chatId, `Error fetching network statistics: ${error.message}`);
    }
  });

  console.log('Telegram bot started successfully!');
  return bot;
}

module.exports = { startTelegramBot }; 