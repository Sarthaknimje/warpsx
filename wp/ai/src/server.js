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

// Add explicit route for theme.css to debug any issues
app.get('/theme.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'theme.css'));
});

// Add explicit route for app screenshot image
app.get('/images/app-screenshot.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'images', 'app-screenshot.png'));
});

// Routes
app.get('/', (req, res) => {
  res.render('landing', { 
    title: 'WarpX - MultiversX Warp Generator',
    error: null
  });
});

app.get('/app', (req, res) => {
  res.render('index', { 
    title: 'MultiversX AI Warp Generator',
    result: null,
    preview: null,
    error: null,
    warpResult: null
  });
});

// New route to check alias availability
app.get('/check-alias', async (req, res) => {
  try {
    const alias = req.query.alias;
    
    if (!alias) {
      return res.status(400).json({ error: 'Alias is required' });
    }
    
    const available = await isAliasAvailable(alias);
    
    // Add a slight delay to prevent too many rapid requests
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return res.json({ available });
  } catch (error) {
    console.error('Error checking alias availability:', error);
    return res.status(500).json({ error: 'Failed to check alias availability' });
  }
});

// Handle create-warp form submission
app.post('/create-warp', async (req, res) => {
  try {
    const { prompt, alias } = req.body;
    
    if (!prompt) {
      return res.render('index', { 
        title: 'MultiversX AI Warp Generator',
        result: null,
        preview: null,
        error: 'Please enter a prompt',
        warpResult: null
      });
    }
    
    // Check if alias is available before proceeding
    if (alias) {
      try {
        const available = await isAliasAvailable(alias);
        if (!available) {
          return res.render('index', { 
            title: 'MultiversX AI Warp Generator',
            result: null,
            preview: null,
            error: `The alias "${alias}" is already taken. Please choose another one.`,
            helpfulTips: ['Try adding a unique prefix or suffix to make your alias unique.'],
            warpResult: null
          });
        }
      } catch (aliasError) {
        console.warn('Could not check alias availability:', aliasError);
        // Continue anyway, the alias registration will fail later if it's taken
      }
    }
    
    const warpResult = await processPrompt(prompt, alias || null);
    
    // Add explorer link to the result
    warpResult.explorerLink = `https://devnet-explorer.multiversx.com/transactions/${warpResult.txHash}`;
    
    res.render('index', { 
      title: 'MultiversX AI Warp Generator',
      result: null,
      preview: null,
      error: null,
      warpResult
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
    
    res.render('index', { 
      title: 'MultiversX AI Warp Generator',
      result: null,
      preview: null,
      error: error.message,
      helpfulTips,
      warpResult: null
    });
  }
});

app.post('/generate', async (req, res) => {
  try {
    const { prompt, alias } = req.body;
    
    if (!prompt) {
      return res.render('index', { 
        title: 'MultiversX AI Warp Generator',
        result: null,
        preview: null,
        error: 'Please enter a prompt',
        warpResult: null
      });
    }
    
    // Check if alias is available before proceeding
    if (alias) {
      try {
        const available = await isAliasAvailable(alias);
        if (!available) {
          return res.render('index', { 
            title: 'MultiversX AI Warp Generator',
            result: null,
            preview: null,
            error: `The alias "${alias}" is already taken. Please choose another one.`,
            helpfulTips: ['Try adding a unique prefix or suffix to make your alias unique.'],
            warpResult: null
          });
        }
      } catch (aliasError) {
        console.warn('Could not check alias availability:', aliasError);
        // Continue anyway, the alias registration will fail later if it's taken
      }
    }
    
    const result = await processPrompt(prompt, alias || null);
    
    // Add explorer link to the result
    result.explorerLink = `https://devnet-explorer.multiversx.com/transactions/${result.txHash}`;
    
    res.render('index', { 
      title: 'MultiversX AI Warp Generator',
      result,
      preview: null,
      error: null,
      warpResult: null
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
    
    res.render('index', { 
      title: 'MultiversX AI Warp Generator',
      result: null,
      preview: null,
      error: error.message,
      helpfulTips,
      warpResult: null
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
        error: 'Please enter a prompt',
        warpResult: null
      });
    }
    
    const preview = await previewWarp(prompt);
    
    res.render('index', { 
      title: 'MultiversX AI Warp Generator',
      result: null,
      preview,
      error: null,
      warpResult: null
    });
  } catch (error) {
    console.error('Error previewing warp:', error);
    res.render('index', { 
      title: 'MultiversX AI Warp Generator',
      result: null,
      preview: null,
      error: error.message,
      warpResult: null
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
        helpfulTips: ['Provide a valid MultiversX smart contract address', 'Enter the function name you want to call'],
        warpResult: null
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
            helpfulTips: ['Try adding a unique prefix or suffix to make your alias unique.'],
            warpResult: null
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
      error: null,
      warpResult: null
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
      ],
      warpResult: null
    });
  }
});

// Batch warp creation route
app.post('/batch-create', async (req, res) => {
  try {
    const { prompts } = req.body;
    
    // Fix for handling text input with newlines
    let promptArray = [];
    if (typeof prompts === 'string') {
      promptArray = prompts.split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);
    } else if (Array.isArray(prompts)) {
      promptArray = prompts.filter(p => p && p.trim().length > 0);
    }
    
    if (!promptArray.length) {
      return res.render('index', { 
        title: 'MultiversX AI Warp Generator',
        result: null,
        preview: null,
        error: 'Please provide at least one prompt',
        helpfulTips: ['Enter multiple prompts separated by new lines', 'Maximum 5 prompts allowed per batch']
      });
    }
    
    // Limit batch size to 5 to prevent abuse
    const limitedPrompts = promptArray.slice(0, 5);
    console.log("Processing batch prompts:", limitedPrompts);
    
    // Process all prompts
    const results = await processBatchPrompts(limitedPrompts);
    
    // Add explorer links
    results.forEach(result => {
      if (result.success && result.txHash) {
        result.explorerLink = `https://devnet-explorer.multiversx.com/transactions/${result.txHash}`;
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

// Check alias availability API endpoint
app.get('/api/check-alias/:alias', async (req, res) => {
  try {
    const { alias } = req.params;
    
    if (!alias) {
      return res.status(400).json({ success: false, error: 'Alias is required' });
    }
    
    const available = await isAliasAvailable(alias);
    
    res.json({ 
      success: true, 
      alias,
      available
    });
  } catch (error) {
    console.error('Error checking alias availability:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error checking alias availability: ' + error.message 
    });
  }
});

// Direct contract warp route
app.post('/direct-contract', async (req, res) => {
  try {
    const { contractAddress, functionName, args, value, gasLimit, alias } = req.body;
    
    if (!contractAddress || !functionName) {
      return res.render('index', { 
        title: 'MultiversX AI Warp Generator',
        result: null,
        preview: null,
        error: 'Contract address and function name are required',
        helpfulTips: ['Make sure to provide a valid contract address and function name'],
        warpResult: null
      });
    }
    
    // Parse arguments if provided
    let parsedArgs = [];
    if (args && args.trim() !== '') {
      try {
        parsedArgs = JSON.parse(args);
        if (!Array.isArray(parsedArgs)) {
          parsedArgs = [parsedArgs]; // Convert to array if single value
        }
      } catch (parseError) {
        return res.render('index', { 
          title: 'MultiversX AI Warp Generator',
          result: null,
          preview: null,
          error: 'Invalid arguments format. Please provide a valid JSON array',
          helpfulTips: ['Example: ["arg1", "arg2"] or [42, "string"]'],
          warpResult: null
        });
      }
    }
    
    // Process the direct contract warp
    const result = await processDirectContractWarp(
      contractAddress,
      functionName,
      parsedArgs,
      value || '0',
      parseInt(gasLimit) || 60000000,
      alias
    );
    
    // Add explorer link
    if (result.txHash) {
      result.explorerLink = `https://devnet-explorer.multiversx.com/transactions/${result.txHash}`;
    }
    
    // Add helpful tips for alias errors
    let helpfulTips = [];
    if (result.aliasError) {
      helpfulTips.push('If the alias link shows "Warp not found", use the hash link below instead');
      helpfulTips.push('The alias may take a few minutes to propagate in the registry');
      helpfulTips.push('You can always access your warp using the hash link, even if the alias is not working');
    }
    
    res.render('index', { 
      title: 'MultiversX AI Warp Generator',
      result,
      preview: null,
      error: null,
      helpfulTips,
      warpResult: null
    });
  } catch (error) {
    console.error('Error processing direct contract warp:', error);
    
    res.render('index', { 
      title: 'MultiversX AI Warp Generator',
      result: null,
      preview: null,
      error: error.message,
      helpfulTips: error.helpfulTips || [
        'Make sure the contract address is valid',
        'Check that the function name exists on the contract',
        'Ensure arguments are in the correct format'
      ],
      warpResult: null
    });
  }
});

// Handle 404 errors
app.use((req, res, next) => {
  if (req.path.endsWith('.css') || req.path.endsWith('.js') || req.path.includes('/images/')) {
    console.log(`Resource not found: ${req.path}`);
  }
  next();
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 