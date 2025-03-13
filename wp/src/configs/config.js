require('dotenv').config();

const path = require('path');

// Application configuration
const appConfig = {
  mockMode: false, // Always use real blockchain interactions
  debug: true, // Enable debug logging
  port: process.env.PORT || 3000
};

// Wallet configuration
const walletConfig = {
  keystore: process.env.WALLET_KEYSTORE_FILE || path.resolve(__dirname, '../../erd1709y9mhz6487cfzv6t9xpa6hyxtc5kv4zl4za377tn0tqrhtht6sfrdfta.json'),
  password: process.env.WALLET_PASSWORD || 'Pioneers@123', // Should be set in environment variables
  address: process.env.WALLET_ADDRESS || 'erd1709y9mhz6487cfzv6t9xpa6hyxtc5kv4zl4za377tn0tqrhtht6sfrdfta' // Your wallet address
};

// Warp configuration
const warpConfig = {
  env: process.env.MULTIVERSX_NETWORK || 'devnet', // 'devnet', 'testnet', or 'mainnet'
  chainApiUrl: process.env.MULTIVERSX_API_URL || 'https://devnet-api.multiversx.com',
  clientUrl: process.env.WARP_BASE_URL || 'https://devnet.usewarp.to',
  registryAddress: process.env.WARP_REGISTRY_ADDRESS || 'erd1qqqqqqqqqqqqqpgqmuk0q2saj0mgxmk26m3tzzhrrq4fraaea7qsuf8xm5',
  userAddress: walletConfig.address
};

// OpenAI configuration
const openaiConfig = {
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here', // Should be set in environment variables
  model: 'gpt-3.5-turbo'
};

module.exports = {
  appConfig,
  walletConfig,
  warpConfig,
  openaiConfig
}; 