const fs = require('fs');
const { UserSigner, UserSecretKey } = require('@multiversx/sdk-wallet');
const { Address } = require('@multiversx/sdk-core');
const config = require('../configs/config');

/**
 * Load the wallet from the keystore file
 * @returns {Promise<{signer: UserSigner, address: string}>} - The wallet signer and address
 */
async function loadWallet() {
  try {
    // Check if we're in mock mode
    if (config.appConfig.mockMode) {
      console.log('Using mock wallet');
      return {
        signer: {
          sign: async () => Buffer.from('mock_signature')
        },
        address: config.walletConfig.address
      };
    }
    
    // Get the keystore path and password from config
    let keystorePath = config.walletConfig.keystore;
    const password = config.walletConfig.password;
    
    if (!keystorePath || !password) {
      throw new Error('Keystore path or password not provided in configuration');
    }
    
    // Try multiple possible locations for the keystore file
    const possiblePaths = [
      keystorePath,
      `./${keystorePath}`,
      `./ai/${keystorePath}`,
      `${process.cwd()}/${keystorePath}`,
      `${process.cwd()}/ai/${keystorePath}`,
      `${process.cwd()}/${keystorePath.replace('./', '')}`
    ];
    
    let keyFileContents = null;
    let usedPath = null;
    
    // Try each path until we find a valid keystore file
    for (const path of possiblePaths) {
      try {
        console.log(`Trying to load wallet from keystore: ${path}`);
        keyFileContents = fs.readFileSync(path, { encoding: 'utf8' });
        usedPath = path;
        console.log(`Successfully loaded keystore from: ${path}`);
        break;
      } catch (err) {
        console.log(`Could not load keystore from: ${path}`);
      }
    }
    
    if (!keyFileContents) {
      throw new Error(`Could not find keystore file at any of the following paths: ${possiblePaths.join(', ')}`);
    }
    
    // Parse the keystore file
    const keyFileJson = JSON.parse(keyFileContents);
    
    // Create a UserSigner from the keystore
    const signer = UserSigner.fromWallet(keyFileJson, password);
    
    // Get the address from the signer
    const address = config.walletConfig.address;
    console.log(`Wallet loaded successfully: ${address}`);
    
    return {
      signer,
      address
    };
  } catch (error) {
    console.error('Error loading wallet:', error);
    throw new Error('Failed to load wallet: ' + error.message);
  }
}

module.exports = {
  loadWallet
}; 