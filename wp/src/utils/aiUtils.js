const OpenAI = require('openai');

// Initialize OpenAI client - in a real app, you'd use an API key
// For the hackathon demo, we'll use a mock implementation
const openai = {
  chat: {
    completions: {
      create: async ({ messages }) => {
        // This is a mock implementation that simulates AI response
        // In a real app, you would use: await openai.chat.completions.create({...})
        
        const userMessage = messages.find(m => m.role === 'user')?.content || '';
        
        // Extract intent and parameters using regex patterns
        let intent = 'unknown';
        const params = {};
        
        // Check for staking intent
        if (/stake|staking|delegate/i.test(userMessage)) {
          intent = 'staking';
          
          // Extract amount
          const amountMatch = userMessage.match(/(\d+(\.\d+)?)\s*(egld|xegld)/i);
          params.amount = amountMatch ? amountMatch[1] : '1';
          
          // Extract validator
          const validatorMatch = userMessage.match(/validator[:\s]+([a-zA-Z0-9]+)/i) || 
                               userMessage.match(/to[:\s]+([a-zA-Z0-9]+)/i);
          params.validatorAddress = validatorMatch ? validatorMatch[1] : 'erd1qqqqqqqqqqqqqpgqhe8t5jewej0m8pqssj5m2v9u76fphkj37vpsqfz57h';
        }
        // Check for lending intent
        else if (/lend|lending|deposit/i.test(userMessage)) {
          intent = 'lending';
          
          // Extract amount and token
          const amountMatch = userMessage.match(/(\d+(\.\d+)?)\s*([a-zA-Z]+)/i);
          params.amount = amountMatch ? amountMatch[1] : '100';
          params.tokenIdentifier = amountMatch ? amountMatch[3].toUpperCase() : 'USDC';
          params.lendingContractAddress = 'erd1qqqqqqqqqqqqqpgq9l7wjrf7rwnm4pj4xf6c2y8vw9eggl587vps5tm8ag';
        }
        // Check for borrowing intent
        else if (/borrow|loan/i.test(userMessage)) {
          intent = 'borrowing';
          
          // Extract borrow amount and token
          const borrowAmountMatch = userMessage.match(/borrow\s+(\d+(\.\d+)?)\s*([a-zA-Z]+)/i);
          params.amount = borrowAmountMatch ? borrowAmountMatch[1] : '100';
          params.tokenIdentifier = borrowAmountMatch ? borrowAmountMatch[3].toUpperCase() : 'USDC';
          
          // Extract collateral amount and token
          const collateralMatch = userMessage.match(/collateral\s+(\d+(\.\d+)?)\s*([a-zA-Z]+)/i);
          params.collateralAmount = collateralMatch ? collateralMatch[1] : '1';
          params.collateralToken = collateralMatch ? collateralMatch[3].toUpperCase() : 'EGLD';
          
          params.lendingContractAddress = 'erd1qqqqqqqqqqqqqpgq9l7wjrf7rwnm4pj4xf6c2y8vw9eggl587vps5tm8ag';
        }
        // Check for swap intent
        else if (/swap|exchange/i.test(userMessage)) {
          intent = 'swap';
          
          // Extract swap details
          const swapMatch = userMessage.match(/swap\s+(\d+(\.\d+)?)\s*([a-zA-Z]+)\s+(?:to|for)\s+([a-zA-Z]+)/i);
          
          params.amountIn = swapMatch ? swapMatch[1] : '1';
          params.tokenIn = swapMatch ? swapMatch[3].toUpperCase() : 'EGLD';
          params.tokenOut = swapMatch ? swapMatch[4].toUpperCase() : 'USDC';
          params.dexAddress = 'erd1qqqqqqqqqqqqqpgqmuk0q2saj0mgxmk26m3tzzhrrq4fraaea7qsuf8xm5';
        }
        // Check for NFT minting intent
        else if (/nft|mint/i.test(userMessage)) {
          intent = 'nftMint';
          
          // Extract price
          const priceMatch = userMessage.match(/(\d+(\.\d+)?)\s*(egld|xegld)/i);
          params.price = priceMatch ? priceMatch[1] : '0.1';
          
          // Extract contract
          const contractMatch = userMessage.match(/contract[:\s]+([a-zA-Z0-9]+)/i);
          params.nftContractAddress = contractMatch ? contractMatch[1] : 'erd1qqqqqqqqqqqqqpgqmcmzmyw5qwk7jg5xgm6tnkx7kgx0kvf604qsxwqhcu';
        }
        // Default to custom contract
        else {
          intent = 'custom';
          params.contractAddress = 'erd1qqqqqqqqqqqqqpgqhe8t5jewej0m8pqssj5m2v9u76fphkj37vpsqfz57h';
          params.functionName = 'execute';
          params.args = [];
          params.value = '0';
        }
        
        // Return simulated AI response
        return {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  intent,
                  params
                })
              }
            }
          ]
        };
      }
    }
  }
};

/**
 * Analyze a user prompt using AI to extract intent and parameters
 * @param {string} prompt - The user's prompt
 * @returns {Promise<Object>} - The parsed intent and parameters
 */
async function analyzePrompt(prompt) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that helps parse user prompts for blockchain operations. 
          Extract the intent and parameters from the user's prompt. 
          Possible intents: staking, lending, borrowing, swap, nftMint, custom.
          Return a JSON object with 'intent' and 'params' fields.`
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });
    
    // Parse the AI response
    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Error analyzing prompt with AI:', error);
    // Fallback to basic parsing if AI fails
    return fallbackPromptParsing(prompt);
  }
}

/**
 * Fallback method for parsing prompts without AI
 * @param {string} prompt - The user's prompt
 * @returns {Object} - The parsed intent and parameters
 */
function fallbackPromptParsing(prompt) {
  // Convert to lowercase for easier matching
  const lowerPrompt = prompt.toLowerCase();
  
  // Check for different types of warps
  if (lowerPrompt.includes('stake') || lowerPrompt.includes('staking') || lowerPrompt.includes('delegate')) {
    // Extract parameters for staking
    const amountMatch = prompt.match(/(\d+(\.\d+)?)\s*(egld|xegld)/i);
    const amount = amountMatch ? amountMatch[1] : '1'; // Default to 1 EGLD if not specified
    
    const validatorMatch = prompt.match(/validator[:\s]+([a-zA-Z0-9]+)/i) || 
                          prompt.match(/to[:\s]+([a-zA-Z0-9]+)/i);
    const validator = validatorMatch ? validatorMatch[1] : 'erd1qqqqqqqqqqqqqpgqhe8t5jewej0m8pqssj5m2v9u76fphkj37vpsqfz57h'; // Default validator
    
    return {
      intent: 'staking',
      params: {
        validatorAddress: validator,
        amount: amount
      }
    };
  } 
  else if (lowerPrompt.includes('lend') || lowerPrompt.includes('lending') || lowerPrompt.includes('deposit')) {
    // Extract parameters for lending
    const amountMatch = prompt.match(/(\d+(\.\d+)?)\s*([a-zA-Z]+)/i);
    const amount = amountMatch ? amountMatch[1] : '100';
    const token = amountMatch ? amountMatch[3].toUpperCase() : 'USDC';
    
    return {
      intent: 'lending',
      params: {
        lendingContractAddress: 'erd1qqqqqqqqqqqqqpgq9l7wjrf7rwnm4pj4xf6c2y8vw9eggl587vps5tm8ag', // Example lending address
        tokenIdentifier: token,
        amount: amount
      }
    };
  }
  else if (lowerPrompt.includes('borrow') || lowerPrompt.includes('loan')) {
    // Extract parameters for borrowing
    const borrowAmountMatch = prompt.match(/borrow\s+(\d+(\.\d+)?)\s*([a-zA-Z]+)/i);
    const borrowAmount = borrowAmountMatch ? borrowAmountMatch[1] : '100';
    const borrowToken = borrowAmountMatch ? borrowAmountMatch[3].toUpperCase() : 'USDC';
    
    const collateralMatch = prompt.match(/collateral\s+(\d+(\.\d+)?)\s*([a-zA-Z]+)/i);
    const collateralAmount = collateralMatch ? collateralMatch[1] : '1';
    const collateralToken = collateralMatch ? collateralMatch[3].toUpperCase() : 'EGLD';
    
    return {
      intent: 'borrowing',
      params: {
        lendingContractAddress: 'erd1qqqqqqqqqqqqqpgq9l7wjrf7rwnm4pj4xf6c2y8vw9eggl587vps5tm8ag', // Example lending address
        tokenIdentifier: borrowToken,
        amount: borrowAmount,
        collateralToken: collateralToken,
        collateralAmount: collateralAmount
      }
    };
  }
  else if (lowerPrompt.includes('swap') || lowerPrompt.includes('exchange')) {
    // Extract parameters for swapping
    const swapMatch = prompt.match(/swap\s+(\d+(\.\d+)?)\s*([a-zA-Z]+)\s+(?:to|for)\s+([a-zA-Z]+)/i);
    
    const amountIn = swapMatch ? swapMatch[1] : '1';
    const tokenIn = swapMatch ? swapMatch[3].toUpperCase() : 'EGLD';
    const tokenOut = swapMatch ? swapMatch[4].toUpperCase() : 'USDC';
    
    return {
      intent: 'swap',
      params: {
        dexAddress: 'erd1qqqqqqqqqqqqqpgqmuk0q2saj0mgxmk26m3tzzhrrq4fraaea7qsuf8xm5', // Example DEX address
        tokenIn: tokenIn,
        tokenOut: tokenOut,
        amountIn: amountIn
      }
    };
  }
  else if (lowerPrompt.includes('nft') || lowerPrompt.includes('mint')) {
    // Extract parameters for NFT minting
    const priceMatch = prompt.match(/(\d+(\.\d+)?)\s*(egld|xegld)/i);
    const price = priceMatch ? priceMatch[1] : '0.1';
    
    const contractMatch = prompt.match(/contract[:\s]+([a-zA-Z0-9]+)/i);
    const contract = contractMatch ? contractMatch[1] : 'erd1qqqqqqqqqqqqqpgqmcmzmyw5qwk7jg5xgm6tnkx7kgx0kvf604qsxwqhcu';
    
    return {
      intent: 'nftMint',
      params: {
        nftContractAddress: contract,
        price: price
      }
    };
  }
  else {
    // Default to a custom contract call if we can't determine the intent
    return {
      intent: 'custom',
      params: {
        contractAddress: 'erd1qqqqqqqqqqqqqpgqhe8t5jewej0m8pqssj5m2v9u76fphkj37vpsqfz57h',
        functionName: 'execute',
        args: [],
        value: '0'
      }
    };
  }
}

module.exports = {
  analyzePrompt
}; 