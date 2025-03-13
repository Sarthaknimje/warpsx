/**
 * Helper functions for warp creation and management
 */

/**
 * Calculate the gas limit for a warp transaction based on the warp data
 * @param {Object} warpData - The warp data object
 * @returns {string} - The calculated gas limit as a string
 */
function calculateGasLimit(warpData) {
  // Base gas for the transaction
  let baseGas = 3000000;
  
  // Add gas for each action
  if (warpData.actions && warpData.actions.length > 0) {
    for (const action of warpData.actions) {
      // If the action has a gasLimit, use it
      if (action.gasLimit) {
        baseGas += parseInt(action.gasLimit) / 10; // Add a fraction of the action's gas limit
      } else {
        // Default gas for different action types
        switch (action.type) {
          case 'contract':
            baseGas += 300000;
            break;
          case 'transfer':
            baseGas += 50000;
            break;
          case 'esdt-transfer':
            baseGas += 100000;
            break;
          default:
            baseGas += 100000;
        }
      }
      
      // Add gas for data size
      const dataSize = JSON.stringify(warpData).length;
      baseGas += dataSize * 10; // 10 gas per byte
    }
  }
  
  return baseGas.toString();
}

/**
 * Clean and prepare a warp object for transaction
 * @param {Object} warpData - The warp data to clean
 * @returns {Object} - The cleaned warp data
 */
function cleanWarpObject(warpData) {
  // Create a deep copy to avoid modifying the original
  const cleanedData = JSON.parse(JSON.stringify(warpData));
  
  // Set the current timestamp if not present
  if (!cleanedData.meta.createdAt) {
    cleanedData.meta.createdAt = new Date().toISOString();
  }
  
  // Ensure all actions have the required properties
  cleanedData.actions.forEach(action => {
    // Make sure args is an array
    if (!action.args) {
      action.args = [];
    }
    
    // Fix positions for specific contract functions
    if (action.func === "delegate" && action.inputs) {
      const validatorInput = action.inputs.find(input => input.name === "Validator");
      if (validatorInput) {
        validatorInput.position = "arg:0";
      }
    }
    
    if (action.func === "mint" && action.inputs) {
      const quantityInput = action.inputs.find(input => input.name === "Quantity");
      if (quantityInput) {
        quantityInput.position = "arg:0";
      }
    }
    
    if (action.func === "swapTokensFixedInput" && action.inputs) {
      const minAmountInput = action.inputs.find(input => input.name === "Min Amount Out");
      if (minAmountInput) {
        minAmountInput.position = "arg:2";
      }
    }
    
    // Fix transfer actions
    if (action.type === "transfer" && action.inputs) {
      const receiverInput = action.inputs.find(input => input.name === "Receiver");
      if (receiverInput) {
        receiverInput.position = "receiver";
      }
    }
  });
  
  return cleanedData;
}

/**
 * Create a warp inscription transaction
 * @param {Object} warpData - The warp data
 * @param {Object} wallet - The wallet to use for the transaction
 * @returns {Object} - The created transaction
 */
function createWarpInscriptionTx(warpData, wallet) {
  console.log('Creating warp inscription transaction...');
  
  // Clean up the warp data to ensure it's properly formatted
  const cleanedWarpData = cleanWarpObject(warpData);
  
  // Create the transaction
  const tx = {
    sender: wallet.address,
    receiver: wallet.address,
    data: btoa(JSON.stringify(cleanedWarpData)),
    value: '0',
    gasLimit: calculateGasLimit(cleanedWarpData)
  };
  
  console.log('Transaction created:', tx);
  return tx;
}

module.exports = {
  calculateGasLimit,
  cleanWarpObject,
  createWarpInscriptionTx
}; 