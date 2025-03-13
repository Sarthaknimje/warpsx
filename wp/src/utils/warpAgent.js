const templates = require('./warpTemplates');

/**
 * Parse the intent from a user prompt
 * @param {string} prompt - The user's natural language prompt
 * @returns {string} - The detected intent
 */
function parseIntent(prompt) {
  const promptLower = prompt.toLowerCase();
  
  if (promptLower.includes('stake') || promptLower.includes('staking')) {
    return 'staking';
  }
  
  if (promptLower.includes('unstake') || promptLower.includes('unstaking')) {
    return 'unstaking';
  }
  
  if (promptLower.includes('claim rewards') || promptLower.includes('rewards')) {
    return 'claimRewards';
  }
  
  if (promptLower.includes('swap') || promptLower.includes('exchange')) {
    return 'swap';
  }
  
  if (promptLower.includes('mint') && promptLower.includes('nft')) {
    return 'nftMint';
  }
  
  if (promptLower.includes('transfer') || promptLower.includes('send')) {
    return 'transfer';
  }
  
  // Default to staking if no intent is recognized
  return 'staking';
}

/**
 * Process a user prompt to generate a warp structure
 * @param {string} prompt - The user's natural language prompt
 * @param {string} alias - Optional alias for the warp
 * @param {Object} styling - Optional styling for the warp
 * @returns {Object} - The warp structure
 */
function processPrompt(prompt, alias = null, styling = null) {
  console.log(`Processing prompt: ${prompt} ${alias ? 'with alias: ' + alias : ''}`);
  
  // Parse the intent from the prompt
  const intent = parseIntent(prompt);
  console.log(`Parsed intent: ${intent}`);
  
  // Generate the appropriate warp structure based on the intent
  let warpStructure;
  
  if (intent === 'staking') {
    // Extract amount if specified in the prompt
    const amountMatch = prompt.match(/(\d+(\.\d+)?)\s*egld/i);
    const amount = amountMatch ? amountMatch[1] : "1";
    
    warpStructure = JSON.parse(JSON.stringify(templates.stakingTemplate));
    
    // Update the amount field
    if (warpStructure.actions && warpStructure.actions[0] && warpStructure.actions[0].fields) {
      const amountField = warpStructure.actions[0].fields.find(field => field.name === "Amount");
      if (amountField) {
        amountField.value = amount;
      }
      
      // Also update the value property at the action level
      warpStructure.actions[0].value = amount;
    }
  }
  
  // Apply custom styling if provided
  if (styling && warpStructure) {
    warpStructure.style = styling;
  }
  
  return warpStructure;
}

/**
 * Clean and prepare warp data
 * @param {Object} warpData - The warp data to clean
 * @returns {Object} - The cleaned warp data
 */
function cleanWarpData(warpData) {
  // Create a deep copy to avoid modifying the original
  const cleanedData = JSON.parse(JSON.stringify(warpData));
  
  // Set the current timestamp if not present
  if (!cleanedData.meta || !cleanedData.meta.createdAt) {
    if (!cleanedData.meta) cleanedData.meta = {};
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

// Export the functions
module.exports = {
  parseIntent,
  processPrompt,
  cleanWarpData
}; 