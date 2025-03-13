const { Transaction, TransactionPayload, TransactionVersion } = require('@multiversx/sdk-core');
const crypto = require('crypto');
const config = require('../configs/config');

/**
 * Mock utilities for the hackathon demo
 * These functions simulate blockchain interactions without actually connecting to the network
 */

/**
 * Create a mock transaction for testing
 * @param {string} data - The data to include in the transaction
 * @returns {Transaction} - A mock transaction
 */
function createMockTransaction(data) {
  const payload = new TransactionPayload(data);
  
  const tx = new Transaction({
    nonce: 1,
    value: "0",
    receiver: "erd1qqqqqqqqqqqqqpgqmuk0q2saj0mgxmk26m3tzzhrrq4fraaea7qsuf8xm5",
    sender: config.walletConfig.address,
    gasPrice: 1000000000,
    gasLimit: 50000,
    data: payload,
    chainID: "D",
    version: TransactionVersion.withTxOptions()
  });
  
  return tx;
}

/**
 * Generate a mock transaction hash
 * @returns {string} - A mock transaction hash
 */
function generateMockTxHash() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Mock wallet for testing
 */
const mockWallet = {
  signer: {
    sign: async () => Buffer.from('mock_signature')
  },
  address: 'erd1709y9mhz6487cfzv6t9xpa6hyxtc5kv4zl4za377tn0tqrhtht6sfrdfta'
};

module.exports = {
  createMockTransaction,
  generateMockTxHash,
  mockWallet
}; 