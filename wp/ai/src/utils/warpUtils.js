const { WarpBuilder, WarpRegistry, WarpLink } = require('@vleap/warps');
const { 
  Transaction, 
  TransactionPayload, 
  TransactionVersion, 
  ApiNetworkProvider, 
  Address
} = require('@multiversx/sdk-core');
const config = require('../configs/config');
const { createMockTransaction, generateMockTxHash } = require('./mockUtils');
const crypto = require('crypto');

// Initialize the Warp components with configuration
const warpConfig = {
  env: config.warpConfig.env,
  chainApiUrl: config.warpConfig.chainApiUrl,
  userAddress: config.walletConfig.address,
  clientUrl: config.warpConfig.clientUrl
};

// Create instances of the main Warp classes
const warpBuilder = new WarpBuilder(warpConfig);
const warpRegistry = new WarpRegistry(warpConfig);
const warpLink = new WarpLink(warpConfig);

/**
 * Creates a new Warp using the WarpBuilder
 * @param {Object} warpData - The warp data
 * @returns {Promise<Object>} - The created warp
 */
async function createWarp(warpData) {
  try {
    // Build the Warp using the WarpBuilder
    const warp = await warpBuilder
      .setName(warpData.name)
      .setTitle(warpData.title)
      .setDescription(warpData.description)
      .setPreview(warpData.preview)
      .setActions(warpData.actions)
      .build();
    
    return warp;
  } catch (error) {
    console.error('Error creating warp:', error);
    throw new Error('Failed to create warp: ' + error.message);
  }
}

/**
 * Creates a transaction to register a warp with an alias
 * @param {string} txHash - The transaction hash of the warp deployment
 * @param {string} alias - The alias to register
 * @returns {Promise<Transaction>} - The registration transaction
 */
async function createWarpRegistrationTransaction(txHash, alias = null) {
  try {
    // Initialize the registry with proper configuration
    await warpRegistry.init();
    
    // Ensure we have a valid transaction hash
    if (!txHash || typeof txHash !== 'string') {
      throw new Error('Invalid transaction hash provided');
    }
    
    // Additional validation for transaction hash format
    if (!/^[0-9a-fA-F]{64}$/.test(txHash)) {
      console.warn(`Warning: Transaction hash doesn't match expected format (64 hex chars): ${txHash}`);
      // We'll continue anyway as some test environments might use different formats
    }
    
    // Ensure we have a valid alias if provided
    if (alias && (typeof alias !== 'string' || alias.trim() === '')) {
      throw new Error('Invalid alias provided');
    }
    
    console.log(`Creating registration transaction for hash: ${txHash} with alias: ${alias || 'none'}`);
    
    // Create the registration transaction
    const registerTx = warpRegistry.createWarpRegisterTransaction(txHash, alias);
    
    // Log the transaction details for debugging
    console.log('Registration transaction created:', {
      sender: registerTx.sender,
      receiver: registerTx.receiver,
      data: registerTx.data.toString(),
      value: registerTx.value.toString(),
      gasLimit: registerTx.gasLimit.toString()
    });
    
    return registerTx;
  } catch (error) {
    console.error('Error creating warp registration transaction:', error);
    throw new Error('Failed to create warp registration transaction: ' + error.message);
  }
}

/**
 * Creates a transaction with the warp data embedded in txData
 * @param {Object} warp - The warp object
 * @returns {Promise<Transaction>} - The transaction with warp data
 */
async function createWarpTransaction(warp) {
  try {
    // If in mock mode, return a mock transaction
    if (config.appConfig.mockMode) {
      console.log('Using mock transaction');
      return createMockTransaction(JSON.stringify(warp));
    }
    
    // Create a transaction to inscribe the Warp on the blockchain
    const tx = warpBuilder.createInscriptionTransaction(warp);
    
    // Make sure to set the correct chain ID
    if (config.warpConfig.chainID) {
      tx.setChainID(config.warpConfig.chainID);
      console.log(`Setting chain ID to: ${config.warpConfig.chainID}`);
    }
    
    return tx;
  } catch (error) {
    console.error('Error creating warp transaction:', error);
    throw new Error('Failed to create warp transaction: ' + error.message);
  }
}

/**
 * Creates the transaction to deploy the warp on the blockchain
 * @param {Object} warp - The warp object to deploy
 * @param {Object} wallet - The wallet object containing signer and address
 * @returns {Promise<{transaction: Transaction, txHash: string}>} - The transaction and hash
 */
async function createWarpDeploymentTransaction(warp, wallet) {
  try {
    // Create a transaction with the warp data
    const transaction = await createWarpTransaction(warp);
    
    // Set the correct nonce
    const nonce = await getNonce(config.walletConfig.address);
    transaction.setNonce(nonce);
    
    // Sign the transaction
    const signature = await wallet.signer.sign(transaction.serializeForSigning());
    transaction.applySignature(signature);
    
    // Generate a transaction hash
    let txHash;
    try {
      txHash = transaction.getHash().toString();
    } catch (error) {
      console.warn('Could not generate transaction hash automatically, using fallback method:', error.message);
      // Fallback to a deterministic hash based on the transaction data
      const txData = transaction.getData().toString();
      txHash = crypto.createHash('sha256').update(txData).digest('hex');
      console.log('Generated fallback hash:', txHash);
    }
    
    return {
      transaction,
      txHash
    };
  } catch (error) {
    console.error('Error creating warp deployment transaction:', error);
    throw new Error('Failed to create warp deployment transaction: ' + error.message);
  }
}

/**
 * Get the current nonce for an address
 * @param {string} addressString - The wallet address string
 * @returns {Promise<number>} - The current nonce
 */
async function getNonce(addressString) {
  try {
    if (config.appConfig.mockMode) {
      console.log('Using mock nonce: 1');
      return 1; // Mock nonce for demo
    }
    
    // Make sure we have a valid address string
    if (!addressString || typeof addressString !== 'string') {
      throw new Error('Invalid address provided');
    }
    
    console.log(`Getting nonce for address: ${addressString}`);
    
    // Create an Address object from the string
    const address = new Address(addressString);
    
    const provider = new ApiNetworkProvider(config.warpConfig.chainApiUrl, {
      timeout: 10000,
      clientName: 'multiversx-warp-generator'
    });
    
    const account = await provider.getAccount(address);
    console.log(`Current nonce: ${account.nonce}`);
    return account.nonce;
  } catch (error) {
    console.error('Error getting nonce:', error);
    throw new Error('Failed to get nonce: ' + error.message);
  }
}

/**
 * Send a transaction to the network
 * @param {Transaction} transaction - The transaction to send
 * @returns {Promise<string>} - The transaction hash
 */
async function sendTransaction(transaction) {
  try {
    if (config.appConfig.mockMode) {
      console.log('Mock mode: Not sending transaction to network');
      console.log('Transaction hash:', transaction.getHash().toString());
      return transaction.getHash().toString();
    }
    
    const provider = new ApiNetworkProvider(config.warpConfig.chainApiUrl, {
      timeout: 10000,
      clientName: 'multiversx-warp-generator'
    });
    
    // Try to send the transaction with retries
    let attempts = 0;
    const maxAttempts = 3;
    let lastError = null;
    
    while (attempts < maxAttempts) {
      try {
        const txHash = await provider.sendTransaction(transaction);
        console.log('Transaction sent to network. Hash:', txHash);
        return txHash;
      } catch (error) {
        lastError = error;
        attempts++;
        console.error(`Error sending transaction (attempt ${attempts}/${maxAttempts}):`, error.message);
        
        if (attempts < maxAttempts) {
          // Wait before retrying
          const delay = 2000 * attempts; // Increasing delay for each retry
          console.log(`Retrying in ${delay/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // If we get here, all attempts failed
    throw lastError || new Error('Failed to send transaction after multiple attempts');
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw new Error('Failed to send transaction: ' + error.message);
  }
}

/**
 * Verify if a transaction exists and is confirmed on the blockchain
 * @param {string} txHash - Transaction hash to verify
 * @returns {Promise<boolean>} - Whether the transaction is confirmed
 */
async function verifyTransactionStatus(txHash) {
  try {
    if (config.appConfig.mockMode) {
      console.log('Mock mode: Skipping transaction verification');
      return true; // Skip verification in mock mode
    }
    
    if (!txHash || typeof txHash !== 'string') {
      console.warn('Invalid transaction hash provided for verification');
      return false;
    }
    
    console.log(`Verifying transaction status for hash: ${txHash}`);
    
    const provider = new ApiNetworkProvider(config.warpConfig.chainApiUrl, {
      timeout: 10000,
      clientName: 'multiversx-warp-generator'
    });
    
    // Try to get the transaction with retries
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const tx = await provider.getTransaction(txHash);
        
        if (!tx) {
          console.warn(`Transaction ${txHash} not found on the blockchain`);
          attempts++;
          
          if (attempts < maxAttempts) {
            // Wait before retrying
            const delay = 2000 * attempts;
            console.log(`Retrying verification in ${delay/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          return false;
        }
        
        const status = tx.status;
        console.log(`Transaction ${txHash} status: ${status}`);
        
        // Consider 'success' or 'pending' as valid states for registration
        return status === 'success' || status === 'pending';
      } catch (error) {
        console.warn(`Error verifying transaction (attempt ${attempts+1}/${maxAttempts}):`, error.message);
        attempts++;
        
        if (attempts < maxAttempts) {
          // Wait before retrying
          const delay = 2000 * attempts;
          console.log(`Retrying verification in ${delay/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          console.error('Failed to verify transaction after multiple attempts');
          return false;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error verifying transaction status:', error);
    return false;
  }
}

/**
 * Generate a shareable link for a warp
 * @param {string} txHash - The transaction hash or alias
 * @param {boolean} isAlias - Whether the provided ID is an alias
 * @returns {string} - The shareable link
 */
function generateWarpLink(txHash, isAlias = false) {
  try {
    // Ensure txHash is a valid string
    if (!txHash || typeof txHash !== 'string') {
      throw new Error('Invalid transaction hash or alias');
    }
    
    // Try to use the WarpLink builder if available
    try {
      if (warpLink && typeof warpLink.build === 'function') {
        const type = isAlias ? 'alias' : 'hash';
        return warpLink.build(type, txHash);
      } else {
        throw new Error('WarpLink builder not available');
      }
    } catch (builderError) {
      console.error('Error using WarpLink builder:', builderError);
      throw builderError; // Throw to use the fallback
    }
  } catch (error) {
    console.error('Error generating warp link:', error);
    // Fallback to manual link generation if WarpLink fails
    let baseUrl = config.warpConfig.clientUrl || 'https://devnet.usewarp.to';
    
    // Remove trailing slash if present
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    
    // For alias links, we use path-based format: baseUrl/alias
    if (isAlias) {
      return `${baseUrl}/${encodeURIComponent(txHash)}`;
    } else {
      // For hash links, we use path-based format: baseUrl/hash:txHash
      return `${baseUrl}/hash:${encodeURIComponent(txHash)}`;
    }
  }
}

/**
 * Generates a QR code for a warp
 * @param {string} txHash - Transaction hash or alias
 * @param {boolean} isAlias - Whether txHash is an alias
 * @returns {Promise<string>} - The QR code as a data URL for use in img tags
 */
async function generateWarpQRCode(txHash, isAlias = false) {
  try {
    // Generate the link first
    const link = generateWarpLink(txHash, isAlias);
    
    // Use qrcode which can generate proper image data
    const QRCode = require('qrcode');
    
    // Generate a data URL that can be used directly in img tags
    const dataURL = await QRCode.toDataURL(link, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#4161FF',  // Primary color for the QR code
        light: '#FFFFFF'  // White background
      }
    });
    
    return dataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    
    // Create a fallback data URL with an error message
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#1A1A2E" rx="10" ry="10"/>
        <text x="100" y="80" font-family="Arial" font-size="12" fill="#FFFFFF" text-anchor="middle">QR Code generation failed.</text>
        <text x="100" y="100" font-family="Arial" font-size="12" fill="#FFFFFF" text-anchor="middle">Please use the link instead.</text>
        <path d="M80,130 L120,130 M100,110 L100,150" stroke="#FF4C8B" stroke-width="5"/>
      </svg>
    `);
  }
}

module.exports = {
  createWarp,
  createWarpRegistrationTransaction,
  createWarpTransaction,
  createWarpDeploymentTransaction,
  getNonce,
  sendTransaction,
  verifyTransactionStatus,
  generateWarpLink,
  generateWarpQRCode,
  warpBuilder,
  warpRegistry,
  warpLink
}; 