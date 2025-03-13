const { createWarpTransaction, sendTransaction, getNonce } = require('./warpUtils');
const { loadWallet } = require('./wallet');
const { registerAlias } = require('./aliasUtils');

// Function to generate a warp link
function generateWarpLink(identifier, isAlias = false) {
  const baseUrl = 'https://devnet.usewarp.to/';
  if (isAlias) {
    return `${baseUrl}${encodeURIComponent(identifier)}`;
  } else {
    return `${baseUrl}hash%3A${identifier}`;
  }
}

// Function to generate a QR code for a warp
async function generateWarpQRCode(identifier, isAlias = false) {
  const link = generateWarpLink(identifier, isAlias);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`;
}

/**
 * Parse the user prompt to extract intent and parameters
 * @param {string} prompt - The user's natural language prompt
 * @returns {Object} - The parsed intent data
 */
function parseIntent(prompt) {
  const promptLower = prompt.toLowerCase();
  
  // Check for staking intent
  if (promptLower.includes('stake') || promptLower.includes('staking')) {
    const amountMatch = promptLower.match(/(\d+(\.\d+)?)\s*(egld|erd)/i);
    const validatorMatch = promptLower.match(/validator\s+(erd[a-zA-Z0-9]{59})/i);
    
    return {
      intent: 'staking',
      params: {
        amount: amountMatch ? amountMatch[1] : '1',
        validatorAddress: validatorMatch ? validatorMatch[1] : 'erd1qqqqqqqqqqqqqpgqd9rvv2n378e27jcts8vfwynpkm8ng7g7945s2ey76d'
      }
    };
  }
  
  // Check for unstaking intent
  if (promptLower.includes('unstake') || promptLower.includes('unstaking')) {
    const amountMatch = promptLower.match(/(\d+(\.\d+)?)\s*(egld|erd)/i);
    
    return {
      intent: 'unstaking',
      params: {
        amount: amountMatch ? amountMatch[1] : '1'
      }
    };
  }
  
  // Check for claiming rewards intent
  if (promptLower.includes('claim') && promptLower.includes('reward')) {
    return {
      intent: 'claimRewards',
      params: {}
    };
  }
  
  // Check for swap intent
  if (promptLower.includes('swap')) {
    const tokenInMatch = promptLower.match(/swap\s+(\w+)/i);
    const tokenOutMatch = promptLower.match(/for\s+(\w+)/i);
    const amountMatch = promptLower.match(/(\d+(\.\d+)?)\s*(\w+)/i);
    
    return {
      intent: 'swap',
      params: {
        tokenIn: tokenInMatch ? tokenInMatch[1].toUpperCase() : 'EGLD',
        tokenOut: tokenOutMatch ? tokenOutMatch[1].toUpperCase() : 'USDC',
        amountIn: amountMatch ? amountMatch[1] : '0.1'
      }
    };
  }
  
  // Check for NFT minting intent
  if ((promptLower.includes('mint') || promptLower.includes('create')) && promptLower.includes('nft')) {
    const priceMatch = promptLower.match(/(\d+(\.\d+)?)\s*(egld|erd)/i);
    
    return {
      intent: 'nftMint',
      params: {
        price: priceMatch ? priceMatch[1] : '0.05'
      }
    };
  }
  
  // Check for transfer intent
  if (promptLower.includes('send') || promptLower.includes('transfer')) {
    const tokenMatch = promptLower.match(/(egld|usdc|usdt|busd)/i);
    const amountMatch = promptLower.match(/(\d+(\.\d+)?)\s*(egld|usdc|usdt|busd)/i);
    
    if (tokenMatch && tokenMatch[1].toLowerCase() !== 'egld') {
      return {
        intent: 'transferToken',
        params: {
          token: tokenMatch[1].toUpperCase(),
          amount: amountMatch ? amountMatch[1] : '10'
        }
      };
    } else {
      return {
        intent: 'transfer',
        params: {
          amount: amountMatch ? amountMatch[1] : '0.1'
        }
      };
    }
  }
  
  // Default to staking if no intent is recognized
  return {
    intent: 'staking',
    params: {
      amount: '1'
    }
  };
}

/**
 * Process a prompt to create a warp structure
 * @param {string} prompt - The prompt to process
 * @param {string} alias - Optional alias for the warp
 * @param {Object} styling - Optional styling for the warp
 * @returns {Object} - The warp structure
 */
function processPrompt(prompt, alias = null, styling = null) {
  console.log(`Processing prompt: ${prompt}`);
  
  // Parse the intent and parameters from the prompt
  const intentData = parseIntent(prompt);
  console.log('Parsed intent data:', intentData);
  
  // Import all templates
  const templates = require('../templates/warpTemplates');
  
  let warp;
  
  // Configure the warp based on the intent
  switch (intentData.intent) {
    case 'staking':
      warp = templates.stakingTemplate(
        intentData.params.validatorAddress, 
        intentData.params.amount
      );
      
      // Ensure the validator address is correctly positioned as arg:0
      if (warp && warp.actions && warp.actions[0] && warp.actions[0].inputs) {
        const validatorInput = warp.actions[0].inputs.find(input => input.name === "Validator");
        if (validatorInput) {
          validatorInput.position = "arg:0";
        }
      }
      break;
      
    case 'unstaking':
      warp = templates.unstakingTemplate(
        intentData.params.amount
      );
      break;
      
    case 'claimRewards':
      warp = templates.claimRewardsTemplate();
      break;
      
    case 'swap':
      warp = templates.swapTemplate(
        intentData.params.tokenIn,
        intentData.params.tokenOut,
        intentData.params.amountIn
      );
      break;
      
    case 'nftMint':
      warp = templates.nftMintTemplate(
        intentData.params.price
      );
      break;
      
    case 'transfer':
      warp = templates.transferTemplate(
        intentData.params.amount
      );
      break;
      
    case 'transferToken':
      warp = templates.transferTokenTemplate(
        intentData.params.token,
        intentData.params.amount
      );
      break;
      
    default:
      throw new Error('Unsupported intent: ' + intentData.intent);
  }
  
  // Ensure the warp has the correct protocol version
  if (!warp.protocol) {
    warp.protocol = "0.5.0";
  }
  
  // Ensure meta is present
  if (!warp.meta) {
    warp.meta = {
      hash: "",
      creator: "system",
      createdAt: new Date().toISOString()
    };
  }
  
  // Apply custom styling if provided
  if (styling) {
    warp.styling = styling;
  }
  
  // Log the warp structure for debugging
  console.log('Generated warp structure:', JSON.stringify(warp, null, 2));
  
  return warp;
}

/**
 * Create a warp from a prompt
 * @param {string} prompt - The prompt to create a warp from
 * @param {string} alias - Optional alias for the warp
 * @param {Object} styling - Optional styling for the warp
 * @returns {Promise<Object>} - The created warp with transaction details
 */
async function createWarpFromPrompt(prompt, alias = null, styling = null) {
  console.log('Creating warp from prompt:', prompt);
  
  try {
    // Process the prompt to generate a warp structure
    const warpStructure = processPrompt(prompt, alias, styling);
    console.log('Created warp object:', JSON.stringify(warpStructure, null, 2));
    
    // Load the wallet
    console.log('Loading wallet...');
    const wallet = await loadWallet();
    console.log('Wallet loaded successfully');
    
    // Create the warp transaction
    console.log('Creating warp deployment transaction...');
    const tx = await createWarpTransaction(warpStructure, wallet);
    
    // Get the current nonce for the wallet
    const nonce = await getNonce(wallet.address.toString());
    
    // Set the nonce on the transaction
    tx.setNonce(nonce);
    
    // Send the transaction to the blockchain
    console.log('Sending transaction to blockchain...');
    const txHash = await sendTransaction(tx, wallet.signer);
    console.log('Transaction sent successfully with hash:', txHash);
    
    // Generate the warp link
    const link = generateWarpLink(txHash, false);
    console.log('Generated warp link:', link);
    
    // Generate the QR code
    const qrCode = await generateWarpQRCode(txHash, false);
    console.log('Generated QR code');
    
    // Register an alias if provided
    let aliasResult = null;
    if (alias) {
      try {
        // Wait for the transaction to be processed before registering the alias
        console.log('Waiting for transaction to be processed before registering alias...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Register the alias
        const registrationTxHash = await registerAlias(txHash, alias, wallet);
        console.log(`Alias registered successfully. Registration transaction hash: ${registrationTxHash}`);
        
        // Store the alias information
        aliasResult = {
          alias,
          txHash: registrationTxHash
        };
      } catch (error) {
        console.error(`Error registering alias: ${error.message}`);
        aliasResult = {
          error: `Failed to register alias: ${error.message}`
        };
      }
    }
    
    // Return the result with all necessary information
    const result = {
      txHash: txHash,
      link: link,
      warpLink: link,
      qrCode: qrCode,
      alias: aliasResult && !aliasResult.error ? alias : null,
      aliasError: aliasResult && aliasResult.error ? aliasResult.error : null,
      prompt: prompt,
      warpStructure: warpStructure
    };
    
    console.log('Warp created successfully with result:', result);
    return result;
  } catch (error) {
    console.error('Error creating warp from prompt:', error);
    throw new Error(`Failed to create warp from prompt: ${error.message}`);
  }
}

/**
 * Create a warp directly from a warp object
 * @param {Object} warpObject - The warp object to create
 * @returns {Object} - The created warp
 */
async function createWarp(warpObject) {
  console.log('Creating warp from object');
  
  // Validate the warp object
  if (!warpObject || typeof warpObject !== 'object') {
    throw new Error('Invalid warp object provided');
  }
  
  // Ensure required fields are present
  if (!warpObject.protocol) {
    warpObject.protocol = "0.5.0";
  }
  
  if (!warpObject.meta) {
    warpObject.meta = {
      hash: "",
      creator: "system",
      createdAt: new Date().toISOString()
    };
  }
  
  console.log('Warp created successfully');
  return warpObject;
}

/**
 * Create a warp transaction
 * @param {Object} warpData - The warp data
 * @returns {Object} - The created transaction
 */
async function createWarpDeploymentTransaction(warpData) {
  console.log('Loading wallet...');
  const wallet = await loadWallet();
  console.log('Wallet loaded successfully');
  
  console.log('Creating warp deployment transaction...');
  const tx = await createWarpTransaction(warpData, wallet);
  
  // Get the current nonce for the wallet
  const nonce = await getNonce(wallet.address.toString());
  
  // Set the nonce on the transaction
  tx.setNonce(nonce);
  
  console.log(`Deployment transaction created successfully`);
  return tx;
}

module.exports = {
  createWarp,
  createWarpFromPrompt,
  createWarpDeploymentTransaction,
  processPrompt,
  parseIntent,
  generateWarpLink,
  generateWarpQRCode
}; 