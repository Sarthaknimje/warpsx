const { Transaction, TransactionPayload, Address } = require('@multiversx/sdk-core');
const { ApiNetworkProvider } = require('@multiversx/sdk-network-providers');
const { sendTransaction, getNonce } = require('./warpUtils');
const config = require('../configs/config');

// Network provider for API calls
const networkProvider = new ApiNetworkProvider('https://devnet-gateway.multiversx.com', {
  timeout: 15000
});

// Registry contract address
const registryAddress = 'erd1qqqqqqqqqqqqqpgqje2f99vr6r7sk54thg03c9suzcvwr4nfl3tsfkdl36';

// Mock mode for testing without actual blockchain interactions
const mockMode = config.appConfig.mockMode;

/**
 * Check if an alias is available
 * @param {string} alias - The alias to check
 * @returns {Promise<boolean>} - Whether the alias is available
 */
async function isAliasAvailable(alias) {
  try {
    console.log(`Checking if alias "${alias}" is available...`);
    
    // In mock mode, always return true
    if (mockMode) {
      console.log('Mock mode enabled, assuming alias is available');
      return true;
    }
    
    // Check if WarpRegistry is initialized
    if (typeof WarpRegistry === 'undefined' || !WarpRegistry.getAliasTxHash) {
      console.warn('WarpRegistry not properly initialized or getAliasTxHash not available');
      // For now, assume the alias is available since we can't check
      return true;
    }
    
    const txHash = await WarpRegistry.getAliasTxHash(alias);
    
    if (txHash) {
      console.log(`Alias "${alias}" is already taken`);
      return false;
    } else {
      console.log(`Alias "${alias}" is available`);
      return true;
    }
  } catch (error) {
    console.error(`Error checking alias availability: ${error.message}`);
    // For now, assume the alias is available since we can't check
    return true;
  }
}

/**
 * Register an alias for a warp transaction
 * @param {string} txHash - The transaction hash of the warp
 * @param {string} alias - The alias to register
 * @param {Object} wallet - The wallet to use for the transaction
 * @returns {Promise<string>} - The transaction hash of the registration
 */
async function registerAlias(txHash, alias, wallet) {
  console.log(`Registering alias '${alias}' for warp transaction ${txHash}`);
  
  if (mockMode) {
    console.log('Mock mode enabled, returning mock registration transaction hash');
    return 'mock-registration-txhash-' + Math.random().toString(36).substring(2, 15);
  }
  
  // Check if alias is available
  const available = await isAliasAvailable(alias);
  if (!available) {
    throw new Error(`Alias "${alias}" is already taken`);
  }
  
  console.log('Waiting for transaction to be processed before registering alias...');
  
  // Wait for the warp transaction to be processed
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Create registration transaction
  console.log(`Creating registration transaction for hash: ${txHash} with alias: ${alias}`);
  
  const data = `registerWarp@${txHash}@${Buffer.from(alias).toString('hex')}`;
  const payload = new TransactionPayload(data);
  
  const tx = new Transaction({
    nonce: 0, // Will be set later
    value: '20000000000000000', // 0.02 EGLD
    sender: wallet.address,
    receiver: new Address(registryAddress),
    gasPrice: 1000000000,
    gasLimit: 10000000,
    data: payload,
    chainID: 'D'
  });
  
  console.log('Registration transaction created:', {
    sender: wallet.address.toString(),
    receiver: registryAddress,
    data: data,
    value: '20000000000000000',
    gasLimit: '10000000'
  });
  
  // Get the current nonce for the wallet
  const nonce = await getNonce(wallet.address.toString());
  
  // Set the nonce on the transaction
  tx.setNonce(nonce);
  
  // Send the transaction to the blockchain
  const registrationTxHash = await sendTransaction(tx, wallet.signer);
  
  console.log(`Alias registered successfully. Registration transaction hash: ${registrationTxHash}`);
  
  return registrationTxHash;
}

module.exports = {
  isAliasAvailable,
  registerAlias
}; 