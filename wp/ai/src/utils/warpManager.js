const { warpRegistry } = require('./warpUtils');
const config = require('../configs/config');
const { ApiNetworkProvider, Address } = require('@multiversx/sdk-core');

/**
 * Helper function to safely check if an alias exists
 * @param {string} alias - The alias to check
 * @returns {Promise<boolean>} - True if exists, false if not
 */
async function safeCheckAliasExists(alias) {
  try {
    // Validate alias
    if (!alias || typeof alias !== 'string' || alias.trim() === '') {
      console.warn('Invalid alias provided for checking');
      return false;
    }
    
    // Check if registry is available
    if (!warpRegistry) {
      console.warn('Warp registry not available for alias check');
      return false; // Assume alias is not taken if registry is not available
    }
    
    // First try to initialize registry, with fallback for errors
    try {
      await warpRegistry.init();
    } catch (error) {
      console.warn('Failed to initialize warp registry for alias check:', error.message);
      return false; // Assume alias is not taken if we can't check
    }
    
    // Check if the getAliasTxHash method exists
    if (typeof warpRegistry.getAliasTxHash === 'function') {
      try {
        const txHash = await warpRegistry.getAliasTxHash(alias);
        return txHash !== null && txHash !== undefined; // Alias exists if txHash is returned
      } catch (error) {
        if (error.message && (
            error.message.includes('not found') || 
            error.message.includes('does not exist') ||
            error.message.includes('invalid') ||
            error.message.includes('unavailable')
        )) {
          console.log(`Alias '${alias}' is available`);
          return false; // Alias does not exist
        }
        
        console.warn('Error checking alias using getAliasTxHash:', error.message);
        return false; // Default to not taken on error
      }
    } else {
      // Fallback method if getAliasTxHash doesn't exist
      console.warn('Method getAliasTxHash not available, using fallback method');
      
      // Try isAliasRegistered if it exists as an alternative method
      if (typeof warpRegistry.isAliasRegistered === 'function') {
        try {
          const isRegistered = await warpRegistry.isAliasRegistered(alias);
          return isRegistered;
        } catch (error) {
          console.warn('Error checking alias using isAliasRegistered:', error.message);
          return false; // Default to not taken on error
        }
      }
      
      // Final fallback - we have no way to check, so assume it's available
      console.warn('No methods available to check alias availability');
      return false;
    }
  } catch (error) {
    console.error('Unexpected error checking alias availability:', error);
    return false; // Default to not taken on any unexpected error
  }
}

/**
 * Get a list of warps owned by a specific address
 * @param {string} address - The owner's address
 * @returns {Promise<Array>} - Array of warp details
 */
async function getWarpsByOwner(address) {
  try {
    // Initialize the network provider
    const provider = new ApiNetworkProvider(config.warpConfig.chainApiUrl, {
      timeout: 10000,
      clientName: 'multiversx-warp-generator'
    });

    // Get aliases registered by this address
    const aliases = await warpRegistry.getAddressAliases(address);
    console.log(`Found ${aliases.length} aliases for address ${address}`);

    // Get details for each alias
    const warps = [];
    for (const alias of aliases) {
      try {
        let txHash;
        // Use safe method to get hash
        if (typeof warpRegistry.getAliasTxHash === 'function') {
          txHash = await warpRegistry.getAliasTxHash(alias);
        } else {
          console.warn(`Cannot get txHash for alias ${alias}: getAliasTxHash method not available`);
          continue;
        }
        
        const warpData = await provider.getTransaction(txHash);
        
        warps.push({
          alias,
          txHash,
          deploymentTime: new Date(warpData.timestamp * 1000).toISOString(),
          status: warpData.status,
          link: `${config.warpConfig.clientUrl}/${alias}`
        });
      } catch (error) {
        console.error(`Error fetching details for alias ${alias}:`, error);
        warps.push({
          alias,
          error: error.message,
          link: `${config.warpConfig.clientUrl}/${alias}`
        });
      }
    }

    // Get hash warps (those without aliases)
    const hashWarps = await warpRegistry.getAddressHashes(address);
    for (const hash of hashWarps) {
      try {
        const warpData = await provider.getTransaction(hash);
        
        warps.push({
          txHash: hash,
          deploymentTime: new Date(warpData.timestamp * 1000).toISOString(),
          status: warpData.status,
          link: `${config.warpConfig.clientUrl}/hash:${hash}`
        });
      } catch (error) {
        console.error(`Error fetching details for hash ${hash}:`, error);
        warps.push({
          txHash: hash,
          error: error.message,
          link: `${config.warpConfig.clientUrl}/hash:${hash}`
        });
      }
    }

    return warps;
  } catch (error) {
    console.error('Error getting warps by owner:', error);
    throw new Error('Failed to get warps: ' + error.message);
  }
}

/**
 * Delete a warp alias (unregister it)
 * @param {string} alias - The alias to delete
 * @param {Object} wallet - The wallet object (with signer)
 * @returns {Promise<string>} - The transaction hash of the unregister operation
 */
async function deleteWarpAlias(alias, wallet) {
  try {
    // Initialize the registry
    await warpRegistry.init();
    
    // Create unregister transaction
    const tx = warpRegistry.createWarpUnregisterTransaction(alias);
    
    // Set nonce
    const provider = new ApiNetworkProvider(config.warpConfig.chainApiUrl);
    const account = await provider.getAccount(Address.fromString(wallet.address));
    tx.setNonce(account.nonce);
    
    // Sign transaction
    const signature = await wallet.signer.sign(tx.serializeForSigning());
    tx.applySignature(signature);
    
    // Send transaction
    const txHash = await provider.sendTransaction(tx);
    console.log(`Alias ${alias} unregistered. Transaction hash: ${txHash}`);
    
    return txHash;
  } catch (error) {
    console.error('Error deleting warp alias:', error);
    throw new Error('Failed to delete warp alias: ' + error.message);
  }
}

/**
 * Get global warp statistics
 * @returns {Promise<Object>} - Statistics about warps
 */
async function getWarpStats() {
  try {
    await warpRegistry.init();
    
    // Get total warps count
    const totalAliases = await warpRegistry.getTotalAliases();
    
    // Get recent aliases (last 10)
    const recentAliases = [];
    for (let i = totalAliases; i > Math.max(1, totalAliases - 10); i--) {
      try {
        const alias = await warpRegistry.getAliasAtIndex(i);
        const txHash = await warpRegistry.getAliasTxHash(alias);
        
        recentAliases.push({
          alias,
          txHash,
          link: `${config.warpConfig.clientUrl}/${alias}`
        });
      } catch (error) {
        console.error(`Error fetching alias at index ${i}:`, error);
      }
    }
    
    return {
      totalAliases,
      recentAliases
    };
  } catch (error) {
    console.error('Error getting warp stats:', error);
    throw new Error('Failed to get warp statistics: ' + error.message);
  }
}

/**
 * Check if an alias is available (not taken)
 * @param {string} alias - The alias to check
 * @returns {Promise<boolean>} - True if available, false if taken
 */
async function isAliasAvailable(alias) {
  try {
    // Check if alias exists using our safe method
    const exists = await safeCheckAliasExists(alias);
    
    // If it exists, it's not available
    return !exists;
  } catch (error) {
    console.error('Error checking alias availability:', error);
    throw new Error('Failed to check alias availability: ' + error.message);
  }
}

/**
 * Generate analytics for a specific warp
 * @param {string} identifier - The alias or txHash
 * @param {boolean} isAlias - Whether identifier is an alias
 * @returns {Promise<Object>} - Analytics data
 */
async function getWarpAnalytics(identifier, isAlias = true) {
  try {
    let txHash = identifier;
    let aliasInfo = null;
    
    // If this is an alias, get the txHash
    if (isAlias) {
      try {
        // First check if the registry is available
        if (!warpRegistry) {
          console.warn('Warp registry not available for analytics');
          throw new Error('Warp registry not available');
        }
        
        // Try to initialize the registry
        try {
          await warpRegistry.init();
        } catch (error) {
          console.warn('Failed to initialize warp registry for analytics:', error.message);
          throw new Error('Failed to initialize registry');
        }
        
        // Check if method exists and get txHash
        if (typeof warpRegistry.getAliasTxHash === 'function') {
          try {
            txHash = await warpRegistry.getAliasTxHash(identifier);
            aliasInfo = {
              alias: identifier,
              txHash: txHash
            };
          } catch (error) {
            console.warn(`Error retrieving txHash for alias '${identifier}':`, error.message);
            throw new Error(`Alias ${identifier} not found`);
          }
        } else {
          console.warn('Method getAliasTxHash not available for analytics');
          throw new Error('Required registry method not available');
        }
      } catch (error) {
        // Handle case where alias can't be resolved
        return {
          exists: false,
          error: error.message,
          identifier: identifier,
          isAlias: isAlias
        };
      }
    }
    
    // Validate the txHash
    if (!txHash || typeof txHash !== 'string' || txHash.trim() === '') {
      return {
        exists: false,
        error: 'Invalid transaction hash',
        identifier: identifier,
        isAlias: isAlias
      };
    }
    
    // Now retrieve the transaction data from the chain
    const provider = new ApiNetworkProvider(config.apiUrl);
    
    try {
      const transaction = await provider.getTransaction(txHash);
      
      if (!transaction) {
        return {
          exists: false,
          error: 'Transaction not found',
          identifier: identifier,
          isAlias: isAlias,
          txHash: txHash
        };
      }
      
      // Get warp data if available
      let warpData = null;
      try {
        // If using warpBuilder with getWarpFromTxHash method
        if (warpRegistry && typeof warpRegistry.getWarpFromTxHash === 'function') {
          warpData = await warpRegistry.getWarpFromTxHash(txHash);
        }
      } catch (error) {
        console.warn('Error retrieving warp data:', error.message);
        // Continue without warp data
      }
      
      // Build analytics object
      return {
        exists: true,
        identifier: identifier,
        isAlias: isAlias,
        txHash: txHash,
        aliasInfo: aliasInfo,
        transaction: {
          sender: transaction.sender?.valueOf() || 'Unknown',
          receiver: transaction.receiver?.valueOf() || 'Unknown',
          value: transaction.value?.valueOf() || '0',
          timestamp: transaction.timestamp || Date.now(),
          status: transaction.status || 'unknown',
          gasLimit: transaction.gasLimit?.valueOf() || '0',
          gasPrice: transaction.gasPrice?.valueOf() || '0'
        },
        warpData: warpData
      };
      
    } catch (error) {
      console.error('Error retrieving transaction data:', error);
      return {
        exists: false,
        error: 'Error retrieving transaction: ' + error.message,
        identifier: identifier,
        isAlias: isAlias,
        txHash: txHash
      };
    }
  } catch (error) {
    console.error('Unexpected error in getWarpAnalytics:', error);
    return {
      exists: false,
      error: 'Unexpected error: ' + error.message,
      identifier: identifier,
      isAlias: isAlias
    };
  }
}

module.exports = {
  getWarpsByOwner,
  deleteWarpAlias,
  getWarpStats,
  isAliasAvailable,
  getWarpAnalytics
}; 