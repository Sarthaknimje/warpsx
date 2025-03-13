const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { processPrompt, previewWarp, processDirectContractWarp, processBatchPrompts } = require('./warpAgent');
const { loadWallet } = require('./utils/wallet');
const { 
  getWarpsByOwner, 
  deleteWarpAlias, 
  getWarpStats, 
  isAliasAvailable, 
  getWarpAnalytics 
} = require('./utils/warpManager');
const config = require('./configs/config');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'MultiversX AI Warp Generator',
    result: null,
    preview: null,
    error: null
  });
});

// Batch creation page
app.get('/batch-create', (req, res) => {
  res.render('batch-create', {
    title: 'Batch Warp Creation',
    error: null
  });
});

// API endpoint for generating a warp
app.post('/generate', async (req, res) => {
  try {
    const { prompt, alias, primaryColor, secondaryColor } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a prompt'
      });
    }
    
    // Check if alias is available before proceeding
    if (alias) {
      try {
        const available = await isAliasAvailable(alias);
        if (!available) {
          return res.status(400).json({
            success: false,
            error: `The alias "${alias}" is already taken. Please choose another one.`
          });
        }
      } catch (aliasError) {
        console.warn('Could not check alias availability:', aliasError);
        // Continue anyway, the alias registration will fail later if it's taken
      }
    }
    
    // Process the prompt with optional styling
    const styling = (primaryColor || secondaryColor) ? {
      primaryColor: primaryColor || '#4161FF',
      secondaryColor: secondaryColor || '#8A6FFF'
    } : null;
    
    const result = await processPrompt(prompt, alias || null, styling);
    
    // Add explorer link to the result
    result.explorerLink = `https://devnet-explorer.multiversx.com/transactions/${result.txHash}`;
    
    // Ensure the warpLink is properly formatted with the transaction hash
    if (result.link) {
      result.warpLink = result.link;
    } else if (result.txHash) {
      // Fallback to generating the link manually if it's missing
      result.warpLink = `https://devnet.usewarp.to/hash%3A${result.txHash}`;
    }
    
    // Make sure we're using the transaction hash format, not alias
    if (result.warpLink && !result.warpLink.includes('hash%3A')) {
      result.warpLink = `https://devnet.usewarp.to/hash%3A${result.txHash}`;
    }
    
    // Store the original prompt in the result for display
    result.prompt = prompt;
    
    // If this is an API call (AJAX), return JSON
    if (req.xhr || req.headers.accept.indexOf('json') > -1 || req.headers['content-type'] === 'application/json') {
      return res.json({
        success: true,
        txHash: result.txHash,
        warpLink: result.warpLink,
        alias: result.alias || null,
        explorerLink: result.explorerLink,
        prompt: prompt
      });
    }
    
    // Otherwise, render the page with the result
    res.render('index', { 
      title: 'MultiversX AI Warp Generator',
      result,
      preview: null,
      error: null
    });
  } catch (error) {
    console.error('Error generating warp:', error);
    
    // Prepare helpful error messages
    let helpfulTips = error.helpfulTips || [];
    if (!helpfulTips.length) {
      if (error.message.includes('wallet')) {
        helpfulTips = [
          'Check that your wallet keystore file exists at the path specified in .env',
          'Verify that your wallet password is correct',
          'Ensure your wallet has sufficient EGLD for transaction fees'
        ];
      } else if (error.message.includes('transaction')) {
        helpfulTips = [
          'Check your network connection',
          'Verify that the MultiversX devnet is operational',
          'Ensure your wallet has sufficient EGLD for transaction fees'
        ];
      }
    }
    
    // If this is an API call (AJAX), return JSON error
    if (req.xhr || req.headers.accept.indexOf('json') > -1 || req.headers['content-type'] === 'application/json') {
      return res.status(500).json({
        success: false,
        error: error.message,
        helpfulTips: helpfulTips
      });
    }
    
    // Otherwise, render the page with the error
    res.render('index', { 
      title: 'MultiversX AI Warp Generator',
      result: null,
      preview: null,
      error: error.message,
      helpfulTips
    });
  }
});

app.post('/preview', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.render('index', { 
        title: 'MultiversX AI Warp Generator',
        result: null,
        preview: null,
        error: 'Please enter a prompt'
      });
    }
    
    const preview = await previewWarp(prompt);
    
    res.render('index', { 
      title: 'MultiversX AI Warp Generator',
      result: null,
      preview,
      error: null
    });
  } catch (error) {
    console.error('Error previewing warp:', error);
    res.render('index', { 
      title: 'MultiversX AI Warp Generator',
      result: null,
      preview: null,
      error: error.message
    });
  }
});

// Custom contract warp creation route
app.post('/create-contract-warp', async (req, res) => {
  try {
    const { contractAddress, functionName, args, value, gasLimit, alias } = req.body;
    
    if (!contractAddress || !functionName) {
      return res.render('index', { 
        title: 'MultiversX AI Warp Generator',
        result: null,
        preview: null,
        error: 'Contract address and function name are required',
        helpfulTips: ['Provide a valid MultiversX smart contract address', 'Enter the function name you want to call']
      });
    }
    
    // Check if alias is available
    if (alias) {
      try {
        const available = await isAliasAvailable(alias);
        if (!available) {
          return res.render('index', { 
            title: 'MultiversX AI Warp Generator',
            result: null,
            preview: null,
            error: `The alias "${alias}" is already taken. Please choose another one.`,
            helpfulTips: ['Try adding a unique prefix or suffix to make your alias unique.']
          });
        }
      } catch (aliasError) {
        console.warn('Could not check alias availability:', aliasError);
      }
    }
    
    // Process args (split by commas)
    const parsedArgs = args ? args.split(',').map(arg => arg.trim()) : [];
    
    // Create the warp
    const result = await processDirectContractWarp(
      contractAddress, 
      functionName, 
      parsedArgs, 
      value || '0', 
      gasLimit || 10000000, 
      alias
    );
    
    // Add explorer link to the result
    result.explorerLink = `https://devnet-explorer.multiversx.com/transactions/${result.txHash}`;
    
    res.render('index', { 
      title: 'MultiversX AI Warp Generator',
      result,
      preview: null,
      error: null
    });
  } catch (error) {
    console.error('Error creating contract warp:', error);
    res.render('index', { 
      title: 'MultiversX AI Warp Generator',
      result: null,
      preview: null,
      error: error.message,
      helpfulTips: error.helpfulTips || [
        'Make sure the contract address is valid',
        'Check that the function name exists on the contract',
        'Ensure arguments are in the correct format'
      ]
    });
  }
});

// Batch warp creation route
app.post('/batch-create', async (req, res) => {
  try {
    const { prompts } = req.body;
    
    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return res.render('index', { 
        title: 'MultiversX AI Warp Generator',
        result: null,
        preview: null,
        error: 'Please provide at least one prompt',
        helpfulTips: ['Enter multiple prompts separated by new lines', 'Maximum 5 prompts allowed per batch']
      });
    }
    
    // Limit batch size to 5 to prevent abuse
    const limitedPrompts = prompts.slice(0, 5);
    
    // Process all prompts
    const results = await processBatchPrompts(limitedPrompts);
    
    // Add explorer links
    results.forEach(result => {
      if (result.success && result.txHash) {
        result.explorerLink = `https://devnet-explorer.multiversx.com/transactions/${result.txHash}`;
        
        // Ensure the warpLink is properly formatted with the transaction hash
        if (!result.warpLink || !result.warpLink.includes('hash%3A')) {
          result.warpLink = `https://devnet.usewarp.to/hash%3A${result.txHash}`;
        }
      }
    });
    
    res.render('batch-results', { 
      title: 'Batch Warp Creation Results',
      results,
      error: null
    });
  } catch (error) {
    console.error('Error in batch warp creation:', error);
    res.render('index', { 
      title: 'MultiversX AI Warp Generator',
      result: null,
      preview: null,
      error: 'Error in batch processing: ' + error.message,
      helpfulTips: ['Try processing warps individually for more detailed error messages']
    });
  }
});

// My Warps route
app.get('/my-warps', async (req, res) => {
  try {
    // Load the wallet to get the address
    const wallet = await loadWallet();
    
    // Get warps owned by this address
    const warps = await getWarpsByOwner(wallet.address);
    
    res.render('my-warps', { 
      title: 'My Warps',
      warps,
      address: wallet.address,
      error: null
    });
  } catch (error) {
    console.error('Error fetching warps:', error);
    res.render('my-warps', { 
      title: 'My Warps',
      warps: [],
      address: config.walletConfig.address,
      error: 'Error fetching warps: ' + error.message
    });
  }
});

// Delete Warp route
app.post('/delete-warp', async (req, res) => {
  try {
    const { alias } = req.body;
    
    if (!alias) {
      return res.status(400).json({ success: false, error: 'Alias is required' });
    }
    
    // Load the wallet
    const wallet = await loadWallet();
    
    // Delete the warp alias
    const txHash = await deleteWarpAlias(alias, wallet);
    
    res.json({ 
      success: true, 
      message: `Alias ${alias} unregistered successfully`, 
      txHash,
      explorerLink: `https://devnet-explorer.multiversx.com/transactions/${txHash}`
    });
  } catch (error) {
    console.error('Error deleting warp alias:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error deleting warp alias: ' + error.message 
    });
  }
});

// Warp Analytics route
app.get('/warp-analytics/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const isAlias = !identifier.startsWith('hash:');
    
    const analytics = await getWarpAnalytics(
      isAlias ? identifier : identifier.substring(5), 
      isAlias
    );
    
    res.render('warp-analytics', { 
      title: 'Warp Analytics',
      analytics,
      identifier,
      error: null
    });
  } catch (error) {
    console.error('Error fetching warp analytics:', error);
    res.render('warp-analytics', { 
      title: 'Warp Analytics',
      analytics: null,
      identifier: req.params.identifier,
      error: 'Error fetching analytics: ' + error.message
    });
  }
});

// Warp Statistics route
app.get('/warp-stats', async (req, res) => {
  try {
    const stats = await getWarpStats();
    
    res.render('warp-stats', { 
      title: 'Warp Statistics',
      stats,
      error: null
    });
  } catch (error) {
    console.error('Error fetching warp statistics:', error);
    res.render('warp-stats', { 
      title: 'Warp Statistics',
      stats: null,
      error: 'Error fetching statistics: ' + error.message
    });
  }
});

// Check alias availability route
app.get('/check-alias', async (req, res) => {
  try {
    const { alias } = req.query;
    
    if (!alias) {
      return res.json({ available: false, error: 'No alias provided' });
    }
    
    const available = await isAliasAvailable(alias);
    res.json({ available });
  } catch (error) {
    console.error('Error checking alias availability:', error);
    res.json({ available: false, error: error.message });
  }
});

// Preview warp endpoint
app.post('/preview-warp', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }
    
    // Parse the prompt to extract warp details
    const warpDetails = await warpAgent.parsePrompt(prompt);
    
    if (!warpDetails || !warpDetails.intent) {
      return res.json({
        success: false,
        error: 'Could not determine intent from prompt'
      });
    }
    
    // Prepare preview data based on intent
    let previewData = {
      success: true,
      title: 'MultiversX Action',
      description: 'Execute this action on the MultiversX blockchain',
      function: 'unknown',
      address: 'erd1...',
      args: [],
      preview: 'https://media.multiversx.com/tokens/asset.png'
    };
    
    // Customize preview based on intent
    switch (warpDetails.intent) {
      case 'send':
        previewData.title = 'Send EGLD';
        previewData.description = `Send ${warpDetails.amount || ''} EGLD to ${warpDetails.receiver || 'recipient'}`;
        previewData.function = 'transfer';
        previewData.address = warpDetails.receiver || 'erd1...';
        previewData.args = [
          { name: 'amount', value: `${warpDetails.amount || '0'} EGLD` }
        ];
        previewData.preview = 'https://media.multiversx.com/tokens/asset-egld.png';
        break;
        
      case 'swap':
        previewData.title = 'Swap Tokens';
        previewData.description = `Swap ${warpDetails.fromAmount || ''} ${warpDetails.fromToken || 'tokens'} for ${warpDetails.toToken || 'tokens'}`;
        previewData.function = 'swapTokens';
        previewData.address = 'erd1qqqqqqqqqqqqqpgqd77hstc7668zrkyc4ukq89t4pa55vf9jd8sszj0k0j';
        previewData.args = [
          { name: 'fromToken', value: warpDetails.fromToken || 'EGLD' },
          { name: 'toToken', value: warpDetails.toToken || 'MEX' },
          { name: 'amount', value: warpDetails.fromAmount || '0' }
        ];
        previewData.preview = 'https://media.multiversx.com/tokens/swap.png';
        break;
        
      case 'stake':
        previewData.title = 'Stake EGLD';
        previewData.description = `Stake ${warpDetails.amount || ''} EGLD with validator`;
        previewData.function = 'delegate';
        previewData.address = warpDetails.validator || 'erd1qqqqqqqqqqqqqpgq...';
        previewData.args = [
          { name: 'amount', value: `${warpDetails.amount || '0'} EGLD` }
        ];
        previewData.preview = 'https://media.multiversx.com/tokens/staking.png';
        break;
        
      case 'nft':
        previewData.title = 'NFT Transaction';
        previewData.description = `${warpDetails.action || 'Transfer'} NFT ${warpDetails.collection || 'collection'}`;
        previewData.function = warpDetails.action === 'buy' ? 'buyNft' : 'transferNft';
        previewData.address = warpDetails.marketplace || 'erd1...';
        previewData.args = [
          { name: 'collection', value: warpDetails.collection || '' },
          { name: 'nonce', value: warpDetails.nonce || '' }
        ];
        previewData.preview = 'https://media.multiversx.com/tokens/nft.png';
        break;
        
      default:
        // Generic action
        if (warpDetails.action) {
          previewData.title = warpDetails.action.charAt(0).toUpperCase() + warpDetails.action.slice(1);
          previewData.description = prompt;
          previewData.function = warpDetails.action;
        }
    }
    
    res.json(previewData);
  } catch (error) {
    console.error('Error generating warp preview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate warp preview'
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 