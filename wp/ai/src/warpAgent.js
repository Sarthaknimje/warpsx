const { Configuration, OpenAIApi } = require('openai');
const config = require('./configs/config');
const { loadWallet } = require('./utils/wallet');
const { mockWallet } = require('./utils/mockUtils');
const { 
  createWarp, 
  createWarpDeploymentTransaction, 
  createWarpRegistrationTransaction, 
  sendTransaction, 
  generateWarpLink, 
  generateWarpQRCode,
  getNonce,
  verifyTransactionStatus
} = require('./utils/warpUtils');
const { Address } = require('@multiversx/sdk-core');

/**
 * Parse the user prompt to extract intent and parameters
 * @param {string} prompt - The user's natural language prompt
 * @returns {Object} - The parsed intent data
 */
function parsePrompt(prompt) {
  // For demo purposes, we'll use a simple rule-based approach
  // In a real implementation, this would use a more sophisticated NLP model
  
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
  
  // Check for lending intent
  if (promptLower.includes('lend') || promptLower.includes('lending') || promptLower.includes('earn interest')) {
    const amountMatch = promptLower.match(/(\d+(\.\d+)?)\s*(usdc|usdt|busd|egld|erd)/i);
    const tokenMatch = promptLower.match(/(usdc|usdt|busd|egld|erd)/i);
    
    return {
      intent: 'lending',
      params: {
        amount: amountMatch ? amountMatch[1] : '100',
        tokenIdentifier: tokenMatch ? tokenMatch[1].toUpperCase() : 'USDC',
        lendingContractAddress: 'erd1qqqqqqqqqqqqqpgq9l7wjrf7rwnm4pj4xf6c2y8vw9eggl587vps5tm8ag'
      }
    };
  }
  
  // Check for borrowing intent
  if (promptLower.includes('borrow') || promptLower.includes('loan')) {
    const amountMatch = promptLower.match(/(\d+(\.\d+)?)\s*(usdc|usdt|busd)/i);
    const tokenMatch = promptLower.match(/(usdc|usdt|busd)/i);
    const collateralMatch = promptLower.match(/(\d+(\.\d+)?)\s*(egld|erd)\s+as\s+collateral/i);
    
    return {
      intent: 'borrowing',
      params: {
        amount: amountMatch ? amountMatch[1] : '500',
        tokenIdentifier: tokenMatch ? tokenMatch[1].toUpperCase() : 'USDC',
        collateralAmount: collateralMatch ? collateralMatch[1] : '1',
        collateralToken: 'EGLD',
        lendingContractAddress: 'erd1qqqqqqqqqqqqqpgq9l7wjrf7rwnm4pj4xf6c2y8vw9eggl587vps5tm8ag'
      }
    };
  }
  
  // Check for swap intent
  if (promptLower.includes('swap') || promptLower.includes('exchange')) {
    const amountInMatch = promptLower.match(/(\d+(\.\d+)?)\s*(egld|erd|usdc|usdt|busd)/i);
    const tokenInMatch = promptLower.match(/(egld|erd|usdc|usdt|busd)/i);
    const tokenOutMatch = promptLower.match(/for\s+(egld|erd|usdc|usdt|busd)/i);
    
    return {
      intent: 'swap',
      params: {
        amountIn: amountInMatch ? amountInMatch[1] : '0.1',
        tokenIn: tokenInMatch ? tokenInMatch[1].toUpperCase() : 'EGLD',
        tokenOut: tokenOutMatch ? tokenOutMatch[1].toUpperCase() : 'USDC',
        dexAddress: 'erd1qqqqqqqqqqqqqpgqmuk0q2saj0mgxmk26m3tzzhrrq4fraaea7qsuf8xm5'
      }
    };
  }
  
  // Check for NFT minting intent
  if (promptLower.includes('mint') && (promptLower.includes('nft') || promptLower.includes('collectible'))) {
    const amountMatch = promptLower.match(/(\d+(\.\d+)?)\s*(egld|erd)/i);
    const collectionMatch = promptLower.match(/collection\s+([a-zA-Z0-9-]+)/i);
    
    return {
      intent: 'nftMint',
      params: {
        price: amountMatch ? amountMatch[1] : '0.5',
        collectionName: collectionMatch ? collectionMatch[1] : 'Unknown',
        nftContractAddress: 'erd1qqqqqqqqqqqqqpgqjr3qz32yz3l3p40gm0n30qxts7lskv6822nqpj02hx' // Example NFT contract
      }
    };
  }
  
  // Check for NFT transfer intent
  if ((promptLower.includes('send') || promptLower.includes('transfer')) && 
      (promptLower.includes('nft') || promptLower.includes('collectible'))) {
    const receiverMatch = promptLower.match(/to\s+(erd[a-zA-Z0-9]{59})/i);
    const tokenIdMatch = promptLower.match(/token\s+([a-zA-Z0-9-]+)/i);
    const nonceMatch = promptLower.match(/nonce\s+([a-fA-F0-9]+)/i);
    
    return {
      intent: 'nftTransfer',
      params: {
        receiver: receiverMatch ? receiverMatch[1] : 'erd1qqqqqqqqqqqqqpgqd9rvv2n378e27jcts8vfwynpkm8ng7g7945s2ey76d',
        tokenId: tokenIdMatch ? tokenIdMatch[1] : 'EXAMPLE-123456',
        nonce: nonceMatch ? nonceMatch[1] : '01' // Hex format
      }
    };
  }
  
  // Check for external link intent
  if (promptLower.includes('link') && promptLower.includes('http')) {
    const urlMatch = promptLower.match(/(https?:\/\/[^\s]+)/i);
    const labelMatch = promptLower.match(/label\s+"([^"]+)"/i);
    
    return {
      intent: 'link',
      params: {
        url: urlMatch ? urlMatch[1] : 'https://example.com',
        label: labelMatch ? labelMatch[1] : 'Visit Website',
        description: 'Click to visit external website'
      }
    };
  }
  
  // Check for DAO voting intent
  if (promptLower.includes('vote') && 
     (promptLower.includes('dao') || promptLower.includes('proposal'))) {
    const proposalMatch = promptLower.match(/proposal\s+#?(\d+)/i);
    const voteMatch = promptLower.match(/vote\s+(yes|no)/i);
    
    return {
      intent: 'daoVote',
      params: {
        proposalId: proposalMatch ? proposalMatch[1] : '1',
        voteValue: voteMatch ? voteMatch[1].toLowerCase() === 'yes' : true,
        daoAddress: 'erd1qqqqqqqqqqqqqpgq0lzzvt2faztx4vkn0eeahzahst598xnn22ns9hrdwa' // Example DAO contract
      }
    };
  }
  
  // Check for multi-action intent (swap and stake)
  if (promptLower.includes('swap') && promptLower.includes('stake') && 
      !promptLower.includes('separately')) {
    const amountMatch = promptLower.match(/(\d+(\.\d+)?)\s*(egld|erd)/i);
    
    return {
      intent: 'multiSwapAndStake',
      params: {
        amount: amountMatch ? amountMatch[1] : '0.1',
        dexAddress: 'erd1qqqqqqqqqqqqqpgqmuk0q2saj0mgxmk26m3tzzhrrq4fraaea7qsuf8xm5',
        stakingAddress: 'erd1qqqqqqqqqqqqqpgqc74hkpp6h4cae2p8wt8elz60kddc3lnj7a9smfcra2'
      }
    };
  }
  
  // Check for simple transfer intent
  if (promptLower.includes('send') || promptLower.includes('transfer')) {
    const amountMatch = promptLower.match(/(\d+(\.\d+)?)\s*(egld|erd)/i);
    const receiverMatch = promptLower.match(/to\s+(erd[a-zA-Z0-9]{59})/i);
    
    return {
      intent: 'staking',
      params: {
        amount: amountMatch ? amountMatch[1] : '0.1',
        validatorAddress: 'erd1qqqqqqqqqqqqqpgqqz6vp7vs3p7u8t8gxppjq8qwkx7urj4g7a3s69j92r'
      }
    };
  }
  
  // Default to staking if no specific intent is detected (previously defaulted to transfer)
  return {
    intent: 'staking',
    params: {
      amount: '0.1',
      validatorAddress: 'erd1qqqqqqqqqqqqqpgqqz6vp7vs3p7u8t8gxppjq8qwkx7urj4g7a3s69j92r'
    }
  };
}

/**
 * Create a warp from the parsed intent data
 * @param {Object} intentData - The parsed intent data
 * @returns {Promise<Object>} - The created warp
 */
async function createWarpFromIntent(intentData) {
  try {
    // Import all templates
    const templates = require('./templates/warpTemplates');
    
    let warp;
    
    // Configure the warp based on the intent
    switch (intentData.intent) {
      case 'staking':
        warp = templates.stakingTemplate(
          intentData.params.validatorAddress, 
          intentData.params.amount
        );
        break;
        
      case 'lending':
        warp = templates.lendingTemplate(
          intentData.params.lendingContractAddress,
          intentData.params.tokenIdentifier,
          intentData.params.amount
        );
        break;
        
      case 'borrowing':
        warp = templates.borrowingTemplate(
          intentData.params.lendingContractAddress,
          intentData.params.tokenIdentifier,
          intentData.params.amount,
          intentData.params.collateralToken,
          intentData.params.collateralAmount
        );
        break;
        
      case 'swap':
        warp = templates.swapTemplate(
          intentData.params.dexAddress,
          intentData.params.tokenIn,
          intentData.params.tokenOut,
          intentData.params.amountIn
        );
        break;
        
      case 'nftMint':
        warp = templates.nftMintTemplate(
          intentData.params.nftContractAddress,
          intentData.params.price
        );
        break;
        
      case 'nftTransfer':
        warp = templates.nftTransferTemplate(
          intentData.params.receiver,
          intentData.params.tokenId,
          intentData.params.nonce
        );
        break;
        
      case 'link':
        warp = templates.linkTemplate(
          intentData.params.label,
          intentData.params.url,
          intentData.params.description
        );
        break;
        
      case 'daoVote':
        warp = templates.daoVoteTemplate(
          intentData.params.daoAddress,
          intentData.params.proposalId,
          intentData.params.voteValue
        );
        break;
        
      case 'multiSwapAndStake':
        warp = templates.multiSwapAndStakeTemplate(
          intentData.params.dexAddress,
          intentData.params.stakingAddress,
          intentData.params.amount
        );
        break;
        
      case 'transfer':
        // Convert transfer to staking as a workaround
        warp = templates.stakingTemplate(
          'erd1qqqqqqqqqqqqqpgqqz6vp7vs3p7u8t8gxppjq8qwkx7urj4g7a3s69j92r', // Default validator
          intentData.params.amount
        );
        break;
        
      default:
        throw new Error('Unsupported intent: ' + intentData.intent);
    }
    
    // Validate warp structure before proceeding
    validateWarp(warp);
    
    // Create the warp using the warpUtils
    const createdWarp = await createWarp(warp);
    console.log('Warp created:', createdWarp);
    
    return createdWarp;
  } catch (error) {
    console.error('Error creating warp from intent:', error);
    
    // Provide helpful error messages based on the error type
    let errorMessage = 'Failed to create warp from intent: ' + error.message;
    let helpfulTips = [];
    
    if (error.message.includes('schema validation failed')) {
      helpfulTips.push('The warp schema is invalid. Check that all required fields are provided.');
      helpfulTips.push('Make sure action types match the required structure.');
      helpfulTips.push('Verify that addresses are valid MultiversX addresses.');
    } else if (error.message.includes('Invalid address')) {
      helpfulTips.push('The provided address is not a valid MultiversX address.');
      helpfulTips.push('MultiversX addresses should start with "erd1" and be 62 characters long.');
    } else if (error.message.includes('Invalid value')) {
      helpfulTips.push('The provided value is not valid. Make sure it\'s a positive number.');
      helpfulTips.push('For EGLD values, use numbers with up to 18 decimals.');
    }
    
    throw { 
      message: errorMessage, 
      helpfulTips,
      originalError: error
    };
  }
}

/**
 * Validate the warp data structure
 * @param {Object} warp - The warp object to validate
 * @throws {Error} - If validation fails
 */
function validateWarp(warp) {
  // Check required top-level fields
  if (!warp.name || !warp.title || !warp.actions || !Array.isArray(warp.actions)) {
    throw new Error('Warp is missing required fields (name, title, actions)');
  }
  
  // Check that there is at least one action
  if (warp.actions.length === 0) {
    throw new Error('Warp must have at least one action');
  }
  
  // Validate each action based on its type
  warp.actions.forEach((action, index) => {
    if (!action.type) {
      throw new Error(`Action ${index} is missing the required 'type' field`);
    }
    
    // Check specific fields based on action type
    switch (action.type) {
      case 'contract':
        if (!action.address || !action.func) {
          throw new Error(`Contract action ${index} is missing required fields (address, func)`);
        }
        break;
        
      case 'transfer':
        if (!action.destination || !action.value) {
          throw new Error(`Transfer action ${index} is missing required fields (destination, value)`);
        }
        break;
        
      case 'nft':
        if (!action.destination || !action.token || !action.nonce) {
          throw new Error(`NFT action ${index} is missing required fields (destination, token, nonce)`);
        }
        break;
        
      case 'link':
        if (!action.url) {
          throw new Error(`Link action ${index} is missing required 'url' field`);
        }
        break;
        
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  });
}

/**
 * Deploy a warp to the blockchain and optionally register an alias
 * @param {Object} warp - The warp to deploy
 * @param {string} alias - Optional alias for the warp
 * @returns {Promise<Object>} - The deployment result
 */
async function deployWarp(warp, alias = null) {
  try {
    let wallet;
    
    // Load the wallet based on the configuration
    if (config.appConfig.mockMode) {
      console.log('Using mock wallet');
      wallet = mockWallet;
    } else {
      console.log('Loading real wallet from keystore file...');
      wallet = await loadWallet();
      console.log(`Wallet loaded successfully: ${wallet.address}`);
    }
    
    // Create and sign the deployment transaction
    const { transaction, txHash } = await createWarpDeploymentTransaction(warp, wallet);
    
    // Send the transaction to the network
    const sentTxHash = await sendTransaction(transaction);
    console.log(`Warp deployed with transaction hash: ${sentTxHash}`);
    
    // Wait for the transaction to be processed before registering the alias
    console.log('Waiting for transaction to be processed before registering alias...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Register an alias if provided
    let aliasError = null;
    let finalLink = null;
    let finalQrCode = null;
    let registeredAlias = null;
    
    if (alias) {
      try {
        console.log(`Registering alias '${alias}' for warp transaction ${sentTxHash}`);
        
        // Create the registration transaction
        // IMPORTANT: Always use the hash returned by the network (sentTxHash)
        const registerTx = await createWarpRegistrationTransaction(sentTxHash, alias);
        
        // Get the current nonce for the wallet address
        const nonce = await getNonce(wallet.address);
        registerTx.setNonce(nonce);
        
        // Sign the registration transaction
        const signature = await wallet.signer.sign(registerTx.serializeForSigning());
        registerTx.applySignature(signature);
        
        // Send the registration transaction
        const registerTxHash = await sendTransaction(registerTx);
        console.log(`Alias registered successfully. Registration transaction hash: ${registerTxHash}`);
        
        // Generate the link with the alias
        finalLink = generateWarpLink(alias, true);
        try {
          finalQrCode = await generateWarpQRCode(alias, true);
        } catch (qrError) {
          console.error('Error generating QR code:', qrError);
          finalQrCode = "QR code generation failed. Please use the link instead.";
        }
        
        registeredAlias = alias;
        
        return {
          txHash: sentTxHash,
          link: finalLink,
          qrCode: finalQrCode,
          alias: registeredAlias
        };
      } catch (error) {
        console.error('Error registering alias:', error);
        aliasError = error.message;
      }
    }
    
    // If we get here, either no alias was provided or alias registration failed
    if (!finalLink) {
      finalLink = generateWarpLink(sentTxHash);
    }
    
    if (!finalQrCode) {
      try {
        finalQrCode = await generateWarpQRCode(sentTxHash);
      } catch (qrError) {
        console.error('Error generating QR code:', qrError);
        finalQrCode = "QR code generation failed. Please use the link instead.";
      }
    }
    
    return {
      txHash: sentTxHash,
      link: finalLink,
      qrCode: finalQrCode,
      alias: registeredAlias,
      aliasError
    };
  } catch (error) {
    console.error('Error deploying warp:', error);
    throw new Error('Failed to deploy warp: ' + error.message);
  }
}

/**
 * Process a direct contract warp request
 * @param {string} contractAddress - The contract address
 * @param {string} functionName - The function name to call
 * @param {Array} args - The function arguments
 * @param {string} value - The value to send (in EGLD)
 * @param {number} gasLimit - The gas limit for the transaction
 * @param {string} alias - Optional alias for the warp
 * @returns {Promise<Object>} - The result object
 */
async function processDirectContractWarp(contractAddress, functionName, args, value, gasLimit, alias = null) {
  try {
    console.log(`Processing direct contract warp for ${contractAddress}::${functionName}`);
    
    // Import templates
    const templates = require('./templates/warpTemplates');
    
    // Create a warp using the custom contract template
    const warp = templates.customContractTemplate(
      contractAddress,
      functionName,
      args,
      value,
      gasLimit
    );
    
    // Validate the warp structure
    validateWarp(warp);
    
    // Create and deploy the warp
    const createdWarp = await createWarp(warp);
    
    // Load the wallet
    let wallet;
    try {
      wallet = await loadWallet();
    } catch (error) {
      console.error('Error loading wallet:', error);
      throw new Error('Failed to load wallet: ' + error.message);
    }
    
    // Create and sign the deployment transaction
    const { transaction, txHash } = await createWarpDeploymentTransaction(createdWarp, wallet);
    
    // Send the transaction to the blockchain
    await sendTransaction(transaction);
    
    // Create a link for the warp
    const link = generateWarpLink(txHash, false);
    
    // Generate a QR code for the warp
    const qrCode = await generateWarpQRCode(txHash, false);
    
    // Register an alias if provided
    let aliasResult = null;
    if (alias) {
      try {
        console.log(`Preparing to register alias '${alias}' for warp transaction ${txHash}`);
        
        // Wait for the transaction to be confirmed before registering
        console.log('Waiting for transaction confirmation before registering alias...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Verify the transaction exists on the blockchain before registering
        const isConfirmed = await verifyTransactionStatus(txHash);
        if (!isConfirmed) {
          console.warn(`Transaction ${txHash} not confirmed yet. Registration may fail.`);
          // We'll still try to register, but warn the user
          aliasResult = {
            error: true,
            message: "Transaction not confirmed yet. Try registering the alias later.",
            txHash: txHash
          };
        } else {
          console.log(`Transaction ${txHash} confirmed. Proceeding with alias registration.`);
          
          // Create the alias registration transaction
          const registerTx = await createWarpRegistrationTransaction(txHash, alias);
          
          // Set the nonce for the registration transaction
          const nonce = await getNonce(wallet.address);
          registerTx.setNonce(nonce);
          
          // Sign the registration transaction
          const signature = await wallet.signer.sign(registerTx.serializeForSigning());
          registerTx.applySignature(signature);
          
          // Send the registration transaction
          const aliasTxHash = await sendTransaction(registerTx);
          
          console.log(`Alias registered successfully. Registration transaction hash: ${aliasTxHash}`);
          
          // Update the link to use the alias
          aliasResult = {
            alias,
            txHash: aliasTxHash,
            link: generateWarpLink(alias, true)
          };
        }
      } catch (error) {
        console.error('Error registering alias:', error);
        aliasResult = {
          error: true,
          message: error.message,
          txHash: txHash
        };
      }
    }
    
    // Return the result
    return {
      txHash,
      link: aliasResult && !aliasResult.error ? aliasResult.link : link,
      qrCode,
      alias: aliasResult && !aliasResult.error ? alias : null,
      aliasError: aliasResult && aliasResult.error ? aliasResult.message : null,
      fallbackLink: link // Always provide the hash-based link as fallback
    };
  } catch (error) {
    console.error('Error processing direct contract warp:', error);
    
    // Provide helpful error messages
    let helpfulTips = [];
    if (error.message.includes('Invalid address')) {
      helpfulTips.push('The contract address is not valid');
      helpfulTips.push('MultiversX addresses should start with "erd1" and be 62 characters long');
    } else if (error.message.includes('schema validation failed')) {
      helpfulTips.push('The warp schema is invalid');
      helpfulTips.push('Check function name and arguments');
    }
    
    throw {
      message: 'Failed to create direct contract warp: ' + (error.message || error),
      helpfulTips
    };
  }
}

/**
 * Process multiple prompts as a batch
 * @param {Array<string>} prompts - Array of prompts to process
 * @returns {Promise<Array>} - Array of results
 */
async function processBatchPrompts(prompts) {
  const results = [];
  
  // Load the wallet once to avoid repeated loading
  let wallet;
  try {
    wallet = await loadWallet();
  } catch (error) {
    console.error('Error loading wallet:', error);
    throw new Error('Failed to load wallet: ' + error.message);
  }
  
  // Process each prompt sequentially
  for (const prompt of prompts) {
    try {
      console.log(`Processing batch prompt: ${prompt}`);
      
      // Parse the prompt
      const intentData = parsePrompt(prompt);
      
      // Create a warp from the intent
      const warp = await createWarpFromIntent(intentData);
      
      // Create and sign the deployment transaction
      const { transaction, txHash } = await createWarpDeploymentTransaction(warp, wallet);
      
      // Send the transaction to the blockchain
      await sendTransaction(transaction);
      
      // Create a link for the warp
      const link = generateWarpLink(txHash, false);
      
      // Generate a QR code for the warp
      const qrCode = await generateWarpQRCode(txHash, false);
      
      // Note: We could support aliases for batch warps in the future
      // For now, just create the warps without aliases
      
      // Add to results
      results.push({
        success: true,
        prompt,
        intentData,
        txHash,
        link,
        qrCode
      });
    } catch (error) {
      console.error(`Error processing prompt in batch: ${prompt}`, error);
      
      // Add the error to results
      results.push({
        success: false,
        prompt,
        error: error.message || 'Unknown error',
        helpfulTips: error.helpfulTips || ['Try processing this prompt individually for more details']
      });
    }
  }
  
  return results;
}

/**
 * Process a user prompt to create a warp
 * @param {string} prompt - The user's prompt
 * @param {string} alias - Optional alias for the warp
 * @returns {Promise<Object>} - The result object
 */
async function processPrompt(prompt, alias = null) {
  try {
    console.log(`Processing prompt: ${prompt} ${alias ? `with alias: ${alias}` : ''}`);
    
    // Parse the prompt
    const intentData = parsePrompt(prompt);
    
    // Create a warp from the intent
    const warp = await createWarpFromIntent(intentData);
    
    // Load the wallet
    let wallet;
    try {
      wallet = await loadWallet();
    } catch (error) {
      console.error('Error loading wallet:', error);
      throw new Error('Failed to load wallet: ' + error.message);
    }
    
    // Create and sign the deployment transaction
    const { transaction, txHash } = await createWarpDeploymentTransaction(warp, wallet);
    
    // Send the transaction to the blockchain
    await sendTransaction(transaction);
    
    // Create a link for the warp
    const link = generateWarpLink(txHash, false);
    
    // Generate a QR code for the warp
    const qrCode = await generateWarpQRCode(txHash, false);
    
    // Register an alias if provided
    let aliasResult = null;
    if (alias) {
      try {
        console.log(`Preparing to register alias '${alias}' for warp transaction ${txHash}`);
        
        // Wait for the transaction to be confirmed before registering
        console.log('Waiting for transaction confirmation before registering alias...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Verify the transaction exists on the blockchain before registering
        const isConfirmed = await verifyTransactionStatus(txHash);
        if (!isConfirmed) {
          console.warn(`Transaction ${txHash} not confirmed yet. Registration may fail.`);
          // We'll still try to register, but warn the user
          aliasResult = {
            error: true,
            message: "Transaction not confirmed yet. Try registering the alias later.",
            txHash: txHash
          };
        } else {
          console.log(`Transaction ${txHash} confirmed. Proceeding with alias registration.`);
          
          // Create the alias registration transaction
          const registerTx = await createWarpRegistrationTransaction(txHash, alias);
          
          // Set the nonce for the registration transaction
          const nonce = await getNonce(wallet.address);
          registerTx.setNonce(nonce);
          
          // Sign the registration transaction
          const signature = await wallet.signer.sign(registerTx.serializeForSigning());
          registerTx.applySignature(signature);
          
          // Send the registration transaction
          const aliasTxHash = await sendTransaction(registerTx);
          
          console.log(`Alias registered successfully. Registration transaction hash: ${aliasTxHash}`);
          
          // Update the link to use the alias
          aliasResult = {
            alias,
            txHash: aliasTxHash,
            link: generateWarpLink(alias, true)
          };
        }
      } catch (error) {
        console.error('Error registering alias:', error);
        aliasResult = {
          error: true,
          message: error.message,
          txHash: txHash
        };
      }
    }
    
    // Return the result
    return {
      txHash,
      link: aliasResult && !aliasResult.error ? aliasResult.link : link,
      qrCode,
      alias: aliasResult && !aliasResult.error ? alias : null,
      aliasError: aliasResult && aliasResult.error ? aliasResult.message : null,
      fallbackLink: link // Always provide the hash-based link as fallback
    };
  } catch (error) {
    console.error('Error processing prompt:', error);
    throw error;
  }
}

/**
 * Preview a warp without deploying it
 * @param {string} prompt - The user's prompt
 * @returns {Promise<Object>} - The preview data
 */
async function previewWarp(prompt) {
  try {
    // Parse the prompt
    const intentData = parsePrompt(prompt);
    
    // Create a warp from the intent
    const warp = await createWarpFromIntent(intentData);
    
    return {
      warp,
      intentData
    };
  } catch (error) {
    console.error('Error previewing warp:', error);
    throw error;
  }
}

// Export functions
module.exports = {
  parsePrompt,
  createWarpFromIntent,
  processPrompt,
  previewWarp,
  processDirectContractWarp,
  processBatchPrompts
}; 