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
    // Extract the prompt from warpData for keyword matching
    const prompt = warpData.prompt ? warpData.prompt.toLowerCase() : '';
    
    // Special handling for staking warps
    if (warpData.name === "EGLD Staking" || prompt.includes('stake') || prompt.includes('delegate')) {
      console.log("Creating staking warp with direct builder API");
      
      // Extract the amount from the warp data
      const amount = warpData.actions[0]?.value || "1";
      
      // Check for different staking providers
      if (prompt.includes('xoxno')) {
        // Use XOXNO staking contract
        return {
          protocol: "warp:0.5.0",
          name: "Delegate on XOXNO: EGLD Liquid Staking",
          title: "Delegate operation",
          description: "Delegates(stakes) EGLD to the staking pool by minting xEGLD tokens. Funds accumulate for batch processing to providers for efficient decentralization.",
          preview: "https://api.dicebear.com/7.x/icons/svg?seed=delegate",
          actions: [
            {
              type: "contract",
              label: "delegate",
              address: "erd1qqqqqqqqqqqqqpgqc2d2z4atpxpk7xgucfkc7nrrp5ynscjrah0scsqc35",
              func: "delegate",
              args: [],
              description: "Delegates(stakes) EGLD to the staking pool by minting xEGLD tokens.",
              inputs: [
                {
                  name: "egldAmount",
                  type: "biguint",
                  position: "value",
                  source: "field",
                  required: true,
                  description: "Amount of EGLD to send",
                  min: 0,
                  value: amount
                }
              ],
              value: amount,
              gasLimit: 60000000
            }
          ]
        };
      } else {
        // Default to Hatom staking contract
        return {
          protocol: "warp:0.5.0",
          name: "Delegate on Hatom: EGLD Liquid Staking",
          title: "Delegate operation",
          description: "Allows users to stake EGLD in exchange for sEGLD. The Delegation smart contract is selected based on the current configuration of the delegation algorithm.",
          preview: "https://api.dicebear.com/7.x/icons/svg?seed=delegate",
          actions: [
            {
              type: "contract",
              label: "delegate",
              address: "erd1qqqqqqqqqqqqqpgqd72p7dvjz05cr4dnyc2taexulmskgp6sf5wslrw7wv",
              func: "delegate",
              args: [],
              description: "Allows users to stake EGLD in exchange for sEGLD.",
              inputs: [
                {
                  name: "egldAmount",
                  type: "biguint",
                  position: "value",
                  source: "field",
                  required: true,
                  description: "Amount of EGLD to send",
                  min: 0,
                  value: amount
                }
              ],
              value: amount,
              gasLimit: 60000000
            }
          ]
        };
      }
    }
    
    // Check for protocol reserves query
    if (prompt.includes('protocol reserves') && prompt.includes('hatom')) {
      return {
        protocol: "warp:0.5.0",
        name: "GetProtocolReserves on Hatom: EGLD Liquid Staking",
        title: "GetProtocolReserves operation",
        description: "The current amount of EGLD that belongs to the protocol",
        preview: "https://api.dicebear.com/7.x/icons/svg?seed=getProtocolReserves",
        actions: [
          {
            type: "query",
            label: "getProtocolReserves",
            address: "erd1qqqqqqqqqqqqqpgqd72p7dvjz05cr4dnyc2taexulmskgp6sf5wslrw7wv",
            func: "getProtocolReserves",
            args: [],
            description: "The current amount of EGLD that belongs to the protocol",
            inputs: []
          }
        ]
      };
    }
    
    // Check for rewards reserve query
    if (prompt.includes('rewards reserve') && prompt.includes('hatom')) {
      return {
        protocol: "warp:0.5.0",
        name: "GetRewardsReserve on Hatom: EGLD Liquid Staking",
        title: "GetRewardsReserve operation",
        description: "The current amount of rewards in EGLD",
        preview: "https://api.dicebear.com/7.x/icons/svg?seed=getRewardsReserve",
        actions: [
          {
            type: "query",
            label: "getRewardsReserve",
            address: "erd1qqqqqqqqqqqqqpgqd72p7dvjz05cr4dnyc2taexulmskgp6sf5wslrw7wv",
            func: "getRewardsReserve",
            args: [],
            description: "The current amount of rewards in EGLD",
            inputs: []
          }
        ]
      };
    }
    
    // Check for total withdrawn EGLD query
    if (prompt.includes('total withdrawn') && prompt.includes('xoxno')) {
      return {
        protocol: "warp:0.5.0",
        name: "GetTotalWithdrawnEgld on XOXNO: EGLD Liquid Staking",
        title: "GetTotalWithdrawnEgld operation",
        description: "Returns the total amount of EGLD withdrawn.",
        preview: "https://api.dicebear.com/7.x/icons/svg?seed=getTotalWithdrawnEgld",
        actions: [
          {
            type: "query",
            label: "getTotalWithdrawnEgld",
            address: "erd1qqqqqqqqqqqqqpgqc2d2z4atpxpk7xgucfkc7nrrp5ynscjrah0scsqc35",
            func: "getTotalWithdrawnEgld",
            args: [],
            description: "Returns the total amount of EGLD withdrawn.",
            inputs: []
          }
        ]
      };
    }
    
    // Check for migrate pending
    if (prompt.includes('migrate pending') && prompt.includes('xoxno')) {
      const amount = extractAmount(prompt) || "1";
      
      return {
        protocol: "warp:0.5.0",
        name: "MigratePending on XOXNO: EGLD Liquid Staking",
        title: "MigratePending operation",
        description: "Migrates pending EGLD. Accepts EGLD payments.",
        preview: "https://api.dicebear.com/7.x/icons/svg?seed=migratePending",
        actions: [
          {
            type: "contract",
            label: "migratePending",
            address: "erd1qqqqqqqqqqqqqpgqc2d2z4atpxpk7xgucfkc7nrrp5ynscjrah0scsqc35",
            func: "migratePending",
            args: [],
            description: "Migrates pending EGLD. Accepts EGLD payments.",
            inputs: [
              {
                name: "egldAmount",
                type: "biguint",
                position: "value",
                source: "field",
                required: true,
                description: "Amount of EGLD to send",
                min: 0,
                value: amount,
                modifier: "scale:18"
              }
            ],
            value: amount,
            gasLimit: 60000000
          }
        ]
      };
    }
    
    // Check for add rewards
    if (prompt.includes('add rewards') && prompt.includes('xoxno')) {
      const amount = extractAmount(prompt) || "1";
      
      return {
        protocol: "warp:0.5.0",
        name: "AddRewards on XOXNO: EGLD Liquid Staking",
        title: "AddRewards operation",
        description: "Adds rewards to the contract. Accepts EGLD payments.",
        preview: "https://api.dicebear.com/7.x/icons/svg?seed=addRewards",
        actions: [
          {
            type: "contract",
            label: "addRewards",
            address: "erd1qqqqqqqqqqqqqpgqc2d2z4atpxpk7xgucfkc7nrrp5ynscjrah0scsqc35",
            func: "addRewards",
            args: [],
            description: "Adds rewards to the contract. Accepts EGLD payments.",
            inputs: [
              {
                name: "egldAmount",
                type: "biguint",
                position: "value",
                source: "field",
                required: true,
                description: "Amount of EGLD to send",
                min: 0,
                value: amount,
                modifier: "scale:18"
              }
            ],
            value: amount,
            gasLimit: 60000000
          }
        ]
      };
    }
    
    // Check for deposit to marketplace
    if (prompt.includes('deposit') && prompt.includes('marketplace') && prompt.includes('xoxno')) {
      const amount = extractAmount(prompt) || "1";
      
      return {
        protocol: "warp:0.5.0",
        name: "Deposit on XOXNO: Marketplace",
        title: "Deposit operation",
        description: "This mutable function allows depositing EGLD into the contract.",
        preview: "https://api.dicebear.com/7.x/icons/svg?seed=deposit",
        actions: [
          {
            type: "contract",
            label: "deposit",
            address: "erd1qqqqqqqqqqqqqpgql0dnz6n5hpuw8cptlt00khd0nn4ja8eadsfq2xrqw4",
            func: "deposit",
            args: [],
            description: "This mutable function allows depositing EGLD into the contract.",
            inputs: [
              {
                name: "egldAmount",
                type: "biguint",
                position: "value",
                source: "field",
                required: true,
                description: "Amount of EGLD to send",
                min: 0,
                value: amount,
                modifier: "scale:18"
              }
            ],
            value: amount,
            gasLimit: 60000000
          }
        ]
      };
    }
    
    // Check for bulksend
    if (prompt.includes('bulksend') && !prompt.includes('same amount')) {
      // This is a simplified version - in a real implementation, you would parse the destinations from the prompt
      return {
        protocol: "warp:0.5.0",
        name: "Bulksend on xBulk: Distribution Contract",
        title: "Bulksend operation",
        description: "This endpoint facilitates a bulk transfer of tokens (EGLD or any ESDT), to multiple recipients address. Each recipient's address and the amount to be sent are specified as input.",
        preview: "https://api.dicebear.com/7.x/icons/svg?seed=bulksend",
        actions: [
          {
            type: "contract",
            label: "bulksend",
            address: "erd1qqqqqqqqqqqqqpgq5j3wahajwehwja70v39074zzzjsq89lkdn3qp3j2f9",
            func: "bulksend",
            args: [],
            description: "This endpoint facilitates a bulk transfer of tokens (EGLD or any ESDT), to multiple recipients address. Each recipient's address and the amount to be sent are specified as input.",
            inputs: [
              {
                name: "egldAmount",
                type: "biguint",
                position: "value",
                source: "field",
                required: false,
                description: "Amount of EGLD to send (optional)",
                min: 0,
                modifier: "scale:18"
              },
              {
                name: "destinations",
                type: "variadic:composite(address|biguint)",
                position: "arg:1",
                source: "field",
                required: true,
                description: "Input parameter for destinations",
                bot: "Multiple wallet address and number combination for Destinations. For each entry: 1st, provide a wallet address (starting with \"erd1\"); 2nd, provide a number (a positive number). You can specify multiple entries.",
                min: 0
              }
            ],
            gasLimit: 60000000
          }
        ]
      };
    }
    
    // Check for bulksend same amount
    if (prompt.includes('bulksend same amount') || prompt.includes('send same amount')) {
      // This is a simplified version - in a real implementation, you would parse the destinations from the prompt
      return {
        protocol: "warp:0.5.0",
        name: "BulksendSameAmount on xBulk: Distribution Contract",
        title: "BulksendSameAmount operation",
        description: "This endpoint allows for a bulk transfer of the same amount of tokens (EGLD or any ESDT) to multiple recipients. It requires a list of recipient addresses as input.",
        preview: "https://api.dicebear.com/7.x/icons/svg?seed=bulksendSameAmount",
        actions: [
          {
            type: "contract",
            label: "bulksendSameAmount",
            address: "erd1qqqqqqqqqqqqqpgq5j3wahajwehwja70v39074zzzjsq89lkdn3qp3j2f9",
            func: "bulksendSameAmount",
            args: [],
            description: "This endpoint allows for a bulk transfer of the same amount of tokens (EGLD or any ESDT) to multiple recipients. It requires a list of recipient addresses as input.",
            inputs: [
              {
                name: "egldAmount",
                type: "biguint",
                position: "value",
                source: "field",
                required: false,
                description: "Amount of EGLD to send (optional)",
                min: 0,
                modifier: "scale:18"
              },
              {
                name: "destinations",
                type: "variadic:address",
                position: "arg:1",
                source: "field",
                required: true,
                description: "Input parameter for destinations",
                bot: "One or more wallet address values for Destinations (must be a valid MultiversX address starting with \"erd1\"). You can provide multiple items.",
                pattern: "^erd1[a-zA-Z0-9]{58}$",
                patternDescription: "Must be a valid MultiversX address"
              }
            ],
            gasLimit: 60000000
          }
        ]
      };
    }
    
    // Check for smart send
    if (prompt.includes('smart send') || prompt.includes('smartsend')) {
      // This is a simplified version - in a real implementation, you would parse the destinations from the prompt
      return {
        protocol: "warp:0.5.0",
        name: "SmartSend on Remarkable Tools: Smart Send",
        title: "SmartSend operation",
        description: "This mutable function facilitates sending tokens (EGLD or any ESDT) to multiple recipients. It accepts payments in any token and uses a variadic input for flexible asset and recipient specifications.",
        preview: "https://api.dicebear.com/7.x/icons/svg?seed=smartSend",
        actions: [
          {
            type: "contract",
            label: "smartSend",
            address: "erd1qqqqqqqqqqqqqpgqth4rmhfnlk3kdv2ratveyln3mx7d5ezkx66sf4td4g",
            func: "smartSend",
            args: [],
            description: "This mutable function facilitates sending tokens (EGLD or any ESDT) to multiple recipients. It accepts payments in any token and uses a variadic input for flexible asset and recipient specifications.",
            inputs: [
              {
                name: "egldAmount",
                type: "biguint",
                position: "value",
                source: "field",
                required: false,
                description: "Amount of EGLD to send (optional)",
                min: 0,
                modifier: "scale:18"
              },
              {
                name: "params",
                type: "variadic:composite(address|biguint)",
                position: "arg:1",
                source: "field",
                required: true,
                description: "Input parameter for params",
                bot: "Multiple wallet address and number combination for Params. For each entry: 1st, provide a wallet address (starting with \"erd1\"); 2nd, provide a number (a positive number). You can specify multiple entries.",
                min: 0
              }
            ],
            gasLimit: 60000000
          }
        ]
      };
    }
    
    // Check for buy swap on XOXNO marketplace
    if ((prompt.includes('buy') || prompt.includes('purchase')) && prompt.includes('swap') && prompt.includes('xoxno')) {
      const amount = extractAmount(prompt) || "1";
      
      return {
        protocol: "warp:0.5.0",
        name: "BuySwap on XOXNO: Marketplace",
        title: "BuySwap operation",
        description: "This mutable function allows users to purchase a listed NFT using a swap involving multiple tokens. It accepts payments in any token that can be swaped to EGLD",
        preview: "https://api.dicebear.com/7.x/icons/svg?seed=buySwap",
        actions: [
          {
            type: "contract",
            label: "buySwap",
            address: "erd1qqqqqqqqqqqqqpgql0dnz6n5hpuw8cptlt00khd0nn4ja8eadsfq2xrqw4",
            func: "buySwap",
            args: [],
            description: "This mutable function allows users to purchase a listed NFT using a swap involving multiple tokens. It accepts payments in any token that can be swaped to EGLD",
            inputs: [
              {
                name: "egldAmount",
                type: "biguint",
                position: "value",
                source: "field",
                required: false,
                description: "Amount of EGLD to send (optional)",
                min: 0,
                value: amount,
                modifier: "scale:18"
              },
              {
                name: "auction_id",
                type: "uint64",
                position: "arg:1",
                source: "field",
                required: true,
                description: "Input parameter for auction_id",
                bot: "The uint64 value for Auction id."
              },
              {
                name: "nft_type",
                type: "token",
                position: "arg:2",
                source: "field",
                required: true,
                description: "Input parameter for nft_type",
                bot: "The token value for Nft type.",
                pattern: "^(EGLD|[A-Z0-9]{3,10}(-[a-fA-F0-9]{6})?)$",
                patternDescription: "Must be EGLD or a valid token identifier"
              },
              {
                name: "nft_nonce",
                type: "uint64",
                position: "arg:3",
                source: "field",
                required: true,
                description: "Input parameter for nft_nonce",
                bot: "The uint64 value for Nft nonce."
              },
              {
                name: "steps",
                type: "list:composite(token_in:token|token_out:token|amount_in:biguint|pool_address:address|function_name:string|arguments:list:string)",
                position: "arg:4",
                source: "field",
                required: true,
                description: "Input parameter for steps",
                bot: "A list of structured entries for Steps, where each entry contains: Token in (a token identifier), Token out (a token identifier), Amount in (a positive number), Pool address (a wallet address starting with \"erd1\"), Function name (text), and Arguments (list)."
              },
              {
                name: "limits",
                type: "list:composite(token:token|amount:biguint)",
                position: "arg:5",
                source: "field",
                required: true,
                description: "Input parameter for limits",
                bot: "A list of structured entries for Limits, where each entry contains: Token (a token identifier) and Amount (a positive number)."
              }
            ],
            gasLimit: 60000000
          }
        ]
      };
    }
    
    // Check for direct buy on XOXNO marketplace
    if ((prompt.includes('buy') || prompt.includes('purchase')) && !prompt.includes('swap') && !prompt.includes('for') && prompt.includes('xoxno')) {
      const amount = extractAmount(prompt) || "1";
      
      return {
        protocol: "warp:0.5.0",
        name: "Buy on XOXNO: Marketplace",
        title: "Buy operation",
        description: "This mutable function allows users to directly purchase a listed NFT.",
        preview: "https://api.dicebear.com/7.x/icons/svg?seed=buy",
        actions: [
          {
            type: "contract",
            label: "buy",
            address: "erd1qqqqqqqqqqqqqpgql0dnz6n5hpuw8cptlt00khd0nn4ja8eadsfq2xrqw4",
            func: "buy",
            args: [],
            description: "This mutable function allows users to directly purchase a listed NFT.",
            inputs: [
              {
                name: "egldAmount",
                type: "biguint",
                position: "value",
                source: "field",
                required: true,
                description: "Amount of EGLD to send",
                min: 0,
                value: amount,
                modifier: "scale:18"
              },
              {
                name: "auction_id",
                type: "uint64",
                position: "arg:1",
                source: "field",
                required: true,
                description: "Input parameter for auction_id",
                bot: "The uint64 value for Auction id."
              },
              {
                name: "nft_type",
                type: "token",
                position: "arg:2",
                source: "field",
                required: true,
                description: "Input parameter for nft_type",
                bot: "The token value for Nft type.",
                pattern: "^(EGLD|[A-Z0-9]{3,10}(-[a-fA-F0-9]{6})?)$",
                patternDescription: "Must be EGLD or a valid token identifier"
              },
              {
                name: "nft_nonce",
                type: "uint64",
                position: "arg:3",
                source: "field",
                required: true,
                description: "Input parameter for nft_nonce",
                bot: "The uint64 value for Nft nonce."
              }
            ],
            gasLimit: 60000000
          }
        ]
      };
    }
    
    // Check for buy for someone on XOXNO marketplace
    if ((prompt.includes('buy for') || prompt.includes('purchase for')) && prompt.includes('xoxno')) {
      const amount = extractAmount(prompt) || "1";
      
      return {
        protocol: "warp:0.5.0",
        name: "BuyFor on XOXNO: Marketplace",
        title: "BuyFor operation",
        description: "This mutable function allows users to purchase a listed NFT on behalf of another address.",
        preview: "https://api.dicebear.com/7.x/icons/svg?seed=buyFor",
        actions: [
          {
            type: "contract",
            label: "buyFor",
            address: "erd1qqqqqqqqqqqqqpgql0dnz6n5hpuw8cptlt00khd0nn4ja8eadsfq2xrqw4",
            func: "buyFor",
            args: [],
            description: "This mutable function allows users to purchase a listed NFT on behalf of another address.",
            inputs: [
              {
                name: "egldAmount",
                type: "biguint",
                position: "value",
                source: "field",
                required: true,
                description: "Amount of EGLD to send",
                min: 0,
                value: amount,
                modifier: "scale:18"
              },
              {
                name: "auction_id",
                type: "uint64",
                position: "arg:1",
                source: "field",
                required: true,
                description: "Input parameter for auction_id",
                bot: "The uint64 value for Auction id."
              },
              {
                name: "nft_type",
                type: "token",
                position: "arg:2",
                source: "field",
                required: true,
                description: "Input parameter for nft_type",
                bot: "The token value for Nft type.",
                pattern: "^(EGLD|[A-Z0-9]{3,10}(-[a-fA-F0-9]{6})?)$",
                patternDescription: "Must be EGLD or a valid token identifier"
              },
              {
                name: "nft_nonce",
                type: "uint64",
                position: "arg:3",
                source: "field",
                required: true,
                description: "Input parameter for nft_nonce",
                bot: "The uint64 value for Nft nonce."
              },
              {
                name: "buy_for",
                type: "optional:address",
                position: "arg:5",
                source: "field",
                required: true,
                description: "Input parameter for buy_for",
                bot: "A wallet address for Buy for (must be a valid MultiversX address starting with \"erd1\").",
                pattern: "^erd1[a-zA-Z0-9]{58}$",
                patternDescription: "Must be a valid MultiversX address"
              }
            ],
            gasLimit: 60000000
          }
        ]
      };
    }
    
    // Check for bid on XOXNO marketplace
    if (prompt.includes('bid') && prompt.includes('xoxno')) {
      const amount = extractAmount(prompt) || "1";
      
      return {
        protocol: "warp:0.5.0",
        name: "Bid on XOXNO: Marketplace",
        title: "Bid operation",
        description: "This mutable function allows users to place a bid on a listed NFT.",
        preview: "https://api.dicebear.com/7.x/icons/svg?seed=bid",
        actions: [
          {
            type: "contract",
            label: "bid",
            address: "erd1qqqqqqqqqqqqqpgql0dnz6n5hpuw8cptlt00khd0nn4ja8eadsfq2xrqw4",
            func: "bid",
            args: [],
            description: "This mutable function allows users to place a bid on a listed NFT.",
            inputs: [
              {
                name: "egldAmount",
                type: "biguint",
                position: "value",
                source: "field",
                required: true,
                description: "Amount of EGLD to send",
                min: 0,
                value: amount,
                modifier: "scale:18"
              },
              {
                name: "auction_id",
                type: "uint64",
                position: "arg:1",
                source: "field",
                required: true,
                description: "Input parameter for auction_id",
                bot: "The uint64 value for Auction id."
              },
              {
                name: "nft_type",
                type: "token",
                position: "arg:2",
                source: "field",
                required: true,
                description: "Input parameter for nft_type",
                bot: "The token value for Nft type.",
                pattern: "^(EGLD|[A-Z0-9]{3,10}(-[a-fA-F0-9]{6})?)$",
                patternDescription: "Must be EGLD or a valid token identifier"
              },
              {
                name: "nft_nonce",
                type: "uint64",
                position: "arg:3",
                source: "field",
                required: true,
                description: "Input parameter for nft_nonce",
                bot: "The uint64 value for Nft nonce."
              }
            ],
            gasLimit: 60000000
          }
        ]
      };
    }
    
    // Check for listing on XOXNO marketplace
    if (prompt.includes('list') && prompt.includes('xoxno')) {
      return {
        protocol: "warp:0.5.0",
        name: "Listing on XOXNO: Marketplace",
        title: "Listing operation",
        description: "This mutable function allows users to list one or multiple NFTs for sale on the marketplace. It accepts NFT transfers",
        preview: "https://api.dicebear.com/7.x/icons/svg?seed=listing",
        actions: [
          {
            type: "contract",
            label: "listing",
            address: "erd1qqqqqqqqqqqqqpgql0dnz6n5hpuw8cptlt00khd0nn4ja8eadsfq2xrqw4",
            func: "listing",
            args: [],
            description: "This mutable function allows users to list one or multiple NFTs for sale on the marketplace. It accepts NFT transfers",
            inputs: [
              {
                name: "tokenAmount",
                type: "esdt",
                position: "transfer",
                source: "field",
                required: true,
                description: "Amount and type of tokens to send",
                bot: "Amount and token to send"
              },
              {
                name: "listings",
                type: "variadic:composite(min_bid:biguint|max_bid:biguint|deadline:uint64|accepted_payment_token:token|bid:bool|opt_sft_max_one_per_payment:bool|opt_start_time:uint64|collection:token|nonce:uint64|nft_amount:biguint|royalties:biguint)",
                position: "arg:1",
                source: "field",
                required: true,
                description: "Input parameter for listings",
                bot: "Multiple structured entries for Listings. Each entry should contain: Min bid (a positive number), Max bid (a positive number), Deadline (uint64), Accepted payment token (a token identifier), Bid (true or false), Opt sft max one per payment (true or false), Opt start time (uint64), Collection (a token identifier), Nonce (uint64), Nft amount (a positive number), and Royalties (a positive number). You can provide multiple entries."
              }
            ],
            gasLimit: 60000000
          }
        ]
      };
    }
    
    // Check for send offer on XOXNO marketplace
    if ((prompt.includes('send offer') || prompt.includes('make offer')) && prompt.includes('xoxno')) {
      const amount = extractAmount(prompt) || "1";
      
      return {
        protocol: "warp:0.5.0",
        name: "SendOffer on XOXNO: Marketplace",
        title: "SendOffer operation",
        description: "This mutable function sends an offer for a specific NFT.",
        preview: "https://api.dicebear.com/7.x/icons/svg?seed=sendOffer",
        actions: [
          {
            type: "contract",
            label: "sendOffer",
            address: "erd1qqqqqqqqqqqqqpgql0dnz6n5hpuw8cptlt00khd0nn4ja8eadsfq2xrqw4",
            func: "sendOffer",
            args: [],
            description: "This mutable function sends an offer for a specific NFT.",
            inputs: [
              {
                name: "egldAmount",
                type: "biguint",
                position: "value",
                source: "field",
                required: true,
                description: "Amount of EGLD to send",
                min: 0,
                value: amount,
                modifier: "scale:18"
              },
              {
                name: "payment_token",
                type: "token",
                position: "arg:1",
                source: "field",
                required: true,
                description: "Input parameter for payment_token",
                bot: "The token value for Payment token.",
                pattern: "^(EGLD|[A-Z0-9]{3,10}(-[a-fA-F0-9]{6})?)$",
                patternDescription: "Must be EGLD or a valid token identifier"
              },
              {
                name: "payment_token_nonce",
                type: "uint64",
                position: "arg:2",
                source: "field",
                required: true,
                description: "Input parameter for payment_token_nonce",
                bot: "The uint64 value for Payment token nonce."
              },
              {
                name: "payment_amount",
                type: "biguint",
                position: "arg:3",
                source: "field",
                required: true,
                description: "Input parameter for payment_amount",
                bot: "The number value for Payment amount (must be a positive number).",
                min: 0,
                value: amount,
                modifier: "scale:18"
              },
              {
                name: "nft_type",
                type: "token",
                position: "arg:4",
                source: "field",
                required: true,
                description: "Input parameter for nft_type",
                bot: "The token value for Nft type.",
                pattern: "^(EGLD|[A-Z0-9]{3,10}(-[a-fA-F0-9]{6})?)$",
                patternDescription: "Must be EGLD or a valid token identifier"
              },
              {
                name: "nft_nonce",
                type: "uint64",
                position: "arg:5",
                source: "field",
                required: true,
                description: "Input parameter for nft_nonce",
                bot: "The uint64 value for Nft nonce."
              },
              {
                name: "nft_amount",
                type: "biguint",
                position: "arg:6",
                source: "field",
                required: true,
                description: "Input parameter for nft_amount",
                bot: "The number value for Nft amount (must be a positive number).",
                min: 0,
                value: "1",
                modifier: "scale:18"
              },
              {
                name: "deadline",
                type: "uint64",
                position: "arg:7",
                source: "field",
                required: true,
                description: "Input parameter for deadline",
                bot: "The uint64 value for Deadline."
              }
            ],
            gasLimit: 60000000
          }
        ]
      };
    }
    
    // Check for get undelegate token name on Hatom
    if (prompt.includes('undelegate token name') && prompt.includes('hatom')) {
      return {
        protocol: "warp:0.5.0",
        name: "GetUndelegateTokenName on Hatom: EGLD Liquid Staking",
        title: "GetUndelegateTokenName operation",
        description: "The Undelegate NFT name",
        preview: "https://api.dicebear.com/7.x/icons/svg?seed=getUndelegateTokenName",
        actions: [
          {
            type: "query",
            label: "getUndelegateTokenName",
            address: "erd1qqqqqqqqqqqqqpgqd72p7dvjz05cr4dnyc2taexulmskgp6sf5wslrw7wv",
            func: "getUndelegateTokenName",
            args: [],
            description: "The Undelegate NFT name",
            inputs: []
          }
        ]
      };
    }
    
    // Check for get undelegate token id on Hatom
    if (prompt.includes('undelegate token id') && prompt.includes('hatom')) {
      return {
        protocol: "warp:0.5.0",
        name: "GetUndelegateTokenId on Hatom: EGLD Liquid Staking",
        title: "GetUndelegateTokenId operation",
        description: "The NFT given in exchange for sEGLD at unDelegations",
        preview: "https://api.dicebear.com/7.x/icons/svg?seed=getUndelegateTokenId",
        actions: [
          {
            type: "query",
            label: "getUndelegateTokenId",
            address: "erd1qqqqqqqqqqqqqpgqd72p7dvjz05cr4dnyc2taexulmskgp6sf5wslrw7wv",
            func: "getUndelegateTokenId",
            args: [],
            description: "The NFT given in exchange for sEGLD at unDelegations",
            inputs: []
          }
        ]
      };
    }
    
    // Check for set undelegate token roles on Hatom
    if (prompt.includes('set undelegate token roles') && prompt.includes('hatom')) {
      return {
        protocol: "warp:0.5.0",
        name: "SetUndelegateTokenRoles on Hatom: EGLD Liquid Staking",
        title: "SetUndelegateTokenRoles operation",
        description: "Gives Mint and Burn roles for the Undelegate Nft to this contract.",
        preview: "https://api.dicebear.com/7.x/icons/svg?seed=setUndelegateTokenRoles",
        actions: [
          {
            type: "contract",
            label: "setUndelegateTokenRoles",
            address: "erd1qqqqqqqqqqqqqpgqd72p7dvjz05cr4dnyc2taexulmskgp6sf5wslrw7wv",
            func: "setUndelegateTokenRoles",
            args: [],
            description: "Gives Mint and Burn roles for the Undelegate Nft to this contract.",
            inputs: [],
            gasLimit: 60000000
          }
        ]
      };
    }
    
    // Check for smart nft send
    if ((prompt.includes('smart nft send') || prompt.includes('smartnftsend')) && prompt.includes('remarkable')) {
      return {
        protocol: "warp:0.5.0",
        name: "SmartNftSend on Remarkable Tools: Smart Send",
        title: "SmartNftSend operation",
        description: "This mutable function facilitates sending multiple NFTs to multiple recipients. It accepts payments in any token and uses a variadic input for flexible NFT and recipient specifications.",
        preview: "https://api.dicebear.com/7.x/icons/svg?seed=smartNftSend",
        actions: [
          {
            type: "contract",
            label: "smartNftSend",
            address: "erd1qqqqqqqqqqqqqpgqth4rmhfnlk3kdv2ratveyln3mx7d5ezkx66sf4td4g",
            func: "smartNftSend",
            args: [],
            description: "This mutable function facilitates sending multiple NFTs to multiple recipients. It accepts payments in any token and uses a variadic input for flexible NFT and recipient specifications.",
            inputs: [
              {
                name: "tokenAmount",
                type: "esdt",
                position: "transfer",
                source: "field",
                required: true,
                description: "Amount and type of tokens to send",
                bot: "Amount and token to send"
              },
              {
                name: "params",
                type: "variadic:composite(address|token|uint64)",
                position: "arg:1",
                source: "field",
                required: true,
                description: "Input parameter for params",
                bot: "Multiple wallet address, token and uint64 combination for Params. For each entry: 1st, provide a wallet address (starting with \"erd1\"); 2nd, provide a token; 3rd, provide a uint64. You can specify multiple entries.",
                pattern: "^erd1[a-zA-Z0-9]{58}$",
                patternDescription: "Must be a valid MultiversX address"
              }
            ],
            gasLimit: 60000000
          }
        ]
      };
    }
    
    // Check for get cash reserve on Hatom
    if (prompt.includes('cash reserve') && prompt.includes('hatom')) {
      return {
        protocol: "warp:0.5.0",
        name: "GetCashReserve on Hatom: EGLD Liquid Staking",
        title: "GetCashReserve operation",
        description: "The current amount of EGLD being staked via Liquid Staking amongst all the whitelisted Staking Providers",
        preview: "https://api.dicebear.com/7.x/icons/svg?seed=getCashReserve",
        actions: [
          {
            type: "query",
            label: "getCashReserve",
            address: "erd1qqqqqqqqqqqqqpgqd72p7dvjz05cr4dnyc2taexulmskgp6sf5wslrw7wv",
            func: "getCashReserve",
            args: [],
            description: "The current amount of EGLD being staked via Liquid Staking amongst all the whitelisted Staking Providers",
            inputs: []
          }
        ]
      };
    }
    
    // Check for get total withdrawable on Hatom
    if (prompt.includes('total withdrawable') && prompt.includes('hatom')) {
      return {
        protocol: "warp:0.5.0",
        name: "GetTotalWithdrawable on Hatom: EGLD Liquid Staking",
        title: "GetTotalWithdrawable operation",
        description: "The current total amount of EGLD that can be unbonded or withdraw from all staking providers",
        preview: "https://api.dicebear.com/7.x/icons/svg?seed=getTotalWithdrawable",
        actions: [
          {
            type: "query",
            label: "getTotalWithdrawable",
            address: "erd1qqqqqqqqqqqqqpgqd72p7dvjz05cr4dnyc2taexulmskgp6sf5wslrw7wv",
            func: "getTotalWithdrawable",
            args: [],
            description: "The current total amount of EGLD that can be unbonded or withdraw from all staking providers",
            inputs: []
          }
        ]
      };
    }
    
    // Check for undelegate on XOXNO
    if ((prompt.includes('undelegate') || prompt.includes('unstake') || prompt.includes('withdraw')) && prompt.includes('xoxno')) {
      return {
        protocol: "warp:0.5.0",
        name: "UnDelegate on XOXNO: EGLD Liquid Staking",
        title: "UnDelegate operation",
        description: "Initiates the un-delegation(withdraw) process, allowing you to withdraw your stake. Depending on available pending EGLD, you may receive an instant return or enter a 10-day unbonding period.",
        preview: "https://api.dicebear.com/7.x/icons/svg?seed=unDelegate",
        actions: [
          {
            type: "contract",
            label: "unDelegate",
            address: "erd1qqqqqqqqqqqqqpgqc2d2z4atpxpk7xgucfkc7nrrp5ynscjrah0scsqc35",
            func: "unDelegate",
            args: [],
            description: "Initiates the un-delegation(withdraw) process, allowing you to withdraw your stake. Depending on available pending EGLD, you may receive an instant return or enter a 10-day unbonding period.",
            inputs: [
              {
                name: "tokenAmount",
                type: "esdt",
                position: "transfer",
                source: "field",
                required: true,
                description: "Amount of tokens to send (XEGLD-23b511)",
                options: [
                  "XEGLD-23b511"
                ],
                bot: "Amount and token to send"
              }
            ],
            gasLimit: 60000000
          }
        ]
      };
    }
    
    // Standard warp creation for other types
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

// Helper function to extract amount from prompt
function extractAmount(prompt) {
  const amountMatch = prompt.match(/(\d+(\.\d+)?)\s*(egld|erd)/i);
  return amountMatch ? amountMatch[1] : null;
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