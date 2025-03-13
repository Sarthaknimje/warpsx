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
      timeout: 15000, // Increased timeout
      clientName: 'multiversx-warp-generator'
    });
    
    // Try to get the nonce with retries
    let attempts = 0;
    const maxAttempts = 3;
    let lastError = null;
    
    while (attempts < maxAttempts) {
      try {
        const account = await provider.getAccount(address);
        console.log(`Current nonce: ${account.nonce}`);
        return account.nonce;
      } catch (error) {
        lastError = error;
        attempts++;
        console.error(`Error getting nonce (attempt ${attempts}/${maxAttempts}):`, error.message);
        
        if (attempts < maxAttempts) {
          // Wait before retrying
          const delay = 2000 * attempts;
          console.log(`Retrying in ${delay/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // If we get here, all attempts failed
    throw lastError || new Error('Failed to get nonce after multiple attempts');
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
      timeout: 15000, // Increased timeout
      clientName: 'multiversx-warp-generator'
    });
    
    // Try to send the transaction with retries
    let attempts = 0;
    const maxAttempts = 5; // Increased max attempts
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
        
        // Check for specific error types and handle accordingly
        if (error.message.includes('lowerNonceInTx') || error.message.includes('nonce')) {
          console.log('Nonce error detected. Waiting longer before retry...');
          // Wait longer for nonce errors
          await new Promise(resolve => setTimeout(resolve, 5000 * attempts));
        } else if (error.message.includes('insufficient funds')) {
          console.error('Insufficient funds error. Cannot proceed.');
          throw new Error('Insufficient funds to complete transaction');
        } else if (attempts < maxAttempts) {
          // Standard wait before retrying
          const delay = 3000 * attempts; // Increasing delay for each retry
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
    
    // Always use the direct hash format for consistency
    let baseUrl = config.warpConfig.clientUrl || 'https://devnet.usewarp.to';
    
    // Remove trailing slash if present
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    
    // Always use the hash format for consistency, regardless of isAlias parameter
    return `${baseUrl}/hash%3A${txHash}`;
  } catch (error) {
    console.error('Error generating warp link:', error);
    // Fallback to a simple format
    let baseUrl = config.warpConfig.clientUrl || 'https://devnet.usewarp.to';
    
    // Remove trailing slash if present
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    
    return `${baseUrl}/hash%3A${txHash}`;
  }
}

/**
 * Generate a QR code for a warp link
 * @param {string} txHash - The transaction hash or alias
 * @param {boolean} isAlias - Whether the provided ID is an alias
 * @returns {Promise<string>} - The QR code as a string
 */
async function generateWarpQRCode(txHash, isAlias = false) {
  try {
    // Generate the link first
    const link = generateWarpLink(txHash, isAlias);
    
    // Use qrcode-terminal which is Node.js compatible
    const qrcode = require('qrcode-terminal');
    
    return new Promise((resolve) => {
      // Create a custom stream to capture the output
      const chunks = [];
      const customStream = {
        write: (chunk) => {
          chunks.push(chunk);
        }
      };
      
      // Generate the QR code to our custom stream
      qrcode.generate(link, { small: true, output: 'stream' }, (qrcode) => {
        // If qrcode is provided, use it directly
        if (qrcode) {
          resolve(qrcode);
        } else {
          // Otherwise, use the captured chunks
          resolve(chunks.join('\n'));
        }
      }, customStream);
    }).catch(error => {
      console.error('Error in QR code promise:', error);
      return "QR code generation failed. Please use the link instead.";
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    
    // Fallback to a simpler approach if the above fails
    try {
      const qrcode = require('qrcode-terminal');
      let result = '';
      
      // Override console.log temporarily
      const originalLog = console.log;
      console.log = (msg) => {
        result += msg + '\n';
      };
      
      // Generate the QR code
      qrcode.generate(generateWarpLink(txHash, isAlias), { small: true });
      
      // Restore console.log
      console.log = originalLog;
      
      return result;
    } catch (fallbackError) {
      console.error('Fallback QR code generation failed:', fallbackError);
      return "QR code generation failed. Please use the link instead.";
    }
  }
}

module.exports = {
  createWarp,
  createWarpRegistrationTransaction,
  createWarpTransaction,
  createWarpDeploymentTransaction,
  getNonce,
  sendTransaction,
  generateWarpLink,
  generateWarpQRCode,
  warpBuilder,
  warpRegistry,
  warpLink
}; 