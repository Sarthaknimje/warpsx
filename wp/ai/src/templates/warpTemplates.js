/**
 * Template for staking EGLD on MultiversX
 * @param {string} validatorAddress - The validator's address
 * @param {string} amount - The amount to stake in EGLD
 * @returns {Object} - Warp object
 */
function stakingTemplate(validatorAddress, amount) {
  return {
    name: "EGLD Staking",
    title: "Stake EGLD with a Validator",
    description: "Stake your EGLD to earn rewards and support the MultiversX network",
    preview: "https://media.multiversx.com/tokens/staking.png",
    actions: [
      {
        type: "contract",
        label: "Stake EGLD",
        description: "Delegate your EGLD to a validator to earn staking rewards",
        address: "erd1qqqqqqqqqqqqqpgqqz6vp7vs3p7u8t8gxppjq8qwkx7urj4g7a3s69j92r", // Staking contract address
        func: "delegate",
        args: [], // No explicit args needed as we use value
        value: amount,
        gasLimit: 12000000,
        inputs: [
          {
            name: "Amount",
            description: "Amount to stake in EGLD",
            type: "biguint",
            position: "value",
            source: "field",
            required: true
          },
          {
            name: "Validator",
            description: "Validator address",
            type: "address",
            position: "arg:1",
            source: "field",
            required: true,
          }
        ]
      }
    ]
  };
}

/**
 * Template for lending crypto on a lending platform
 * @param {string} lendingContractAddress - The lending contract address
 * @param {string} tokenIdentifier - The token identifier to lend
 * @param {string} amount - The amount to lend
 * @returns {Object} - Warp object
 */
function lendingTemplate(lendingContractAddress, tokenIdentifier, amount) {
  return {
    name: "Crypto Lending",
    title: "Lend Crypto Assets",
    description: "Lend your crypto assets to earn interest",
    preview: "https://media.multiversx.com/tokens/lending.png",
    actions: [
      {
        type: "contract",
        label: "Lend Assets",
        description: "Deposit your assets to start earning interest",
        address: lendingContractAddress,
        func: "deposit",
        args: [
          `token:${tokenIdentifier}`
        ],
        value: "0",
        gasLimit: 15000000,
        transfers: [
          {
            token: tokenIdentifier,
            amount: amount
          }
        ],
        inputs: [
          {
            name: "Amount",
            description: "Amount to lend",
            type: "biguint",
            position: "transfer",
            source: "field",
            required: true,
          }
        ]
      }
    ]
  };
}

/**
 * Template for borrowing crypto from a lending platform
 * @param {string} lendingContractAddress - The lending contract address
 * @param {string} tokenIdentifier - The token identifier to borrow
 * @param {string} amount - The amount to borrow
 * @param {string} collateralToken - The token identifier to use as collateral
 * @param {string} collateralAmount - The amount of collateral to provide
 * @returns {Object} - Warp object
 */
function borrowingTemplate(lendingContractAddress, tokenIdentifier, amount, collateralToken, collateralAmount) {
  return {
    name: "Crypto Borrowing",
    title: "Borrow Crypto Assets",
    description: "Borrow crypto assets by providing collateral",
    preview: "https://media.multiversx.com/tokens/borrowing.png",
    actions: [
      {
        type: "contract",
        label: "Provide Collateral",
        description: "First, provide collateral to secure your loan",
        address: lendingContractAddress,
        func: "provideCollateral",
        args: [
          `token:${collateralToken}`
        ],
        value: "0",
        gasLimit: 15000000,
        transfers: [
          {
            token: collateralToken,
            amount: collateralAmount
          }
        ],
        inputs: [
          {
            name: "Collateral Amount",
            description: "Amount to provide as collateral",
            type: "biguint",
            position: "transfer",
            source: "field",
            required: true,
          }
        ],
        next: "borrow"
      },
      {
        type: "contract",
        label: "Borrow Assets",
        description: "Borrow the assets after providing collateral",
        address: lendingContractAddress,
        func: "borrow",
        args: [
          `token:${tokenIdentifier}`,
          `biguint:${amount}`
        ],
        value: "0",
        gasLimit: 15000000,
        inputs: [
          {
            name: "Borrow Amount",
            description: "Amount to borrow",
            type: "biguint",
            position: "arg:2",
            source: "field",
            required: true,
          }
        ]
      }
    ]
  };
}

/**
 * Template for swapping tokens on a DEX
 * @param {string} dexAddress - The DEX contract address
 * @param {string} tokenIn - The input token identifier
 * @param {string} tokenOut - The output token identifier
 * @param {string} amountIn - The input amount
 * @returns {Object} - Warp object
 */
function swapTemplate(dexAddress, tokenIn, tokenOut, amountIn) {
  return {
    name: "Token Swap",
    title: "Swap Tokens on DEX",
    description: "Swap your tokens on a decentralized exchange",
    preview: "https://media.multiversx.com/tokens/swap.png",
    actions: [
      {
        type: "contract",
        label: "Swap Tokens",
        description: "Exchange your tokens at the current market rate",
        address: dexAddress,
        func: "swapTokensFixedInput",
        args: [
          `token:${tokenIn}`,
          `token:${tokenOut}`,
          `biguint:1` // Min amount out (1 is a placeholder, normally this would be calculated)
        ],
        value: tokenIn === "EGLD" ? amountIn : "0", // If swapping EGLD, use value
        gasLimit: 20000000,
        transfers: tokenIn !== "EGLD" ? [
          {
            token: tokenIn,
            amount: amountIn
          }
        ] : [],
        inputs: [
          {
            name: "Input Amount",
            description: "Amount to swap",
            type: "biguint",
            position: tokenIn === "EGLD" ? "value" : "transfer",
            source: "field",
            required: true,
          },
          {
            name: "Min Amount Out",
            description: "Minimum amount to receive (slippage protection)",
            type: "biguint",
            position: "arg:3",
            source: "field",
            required: true,
          }
        ]
      }
    ]
  };
}

/**
 * Template for NFT minting
 * @param {string} nftContractAddress - The NFT contract address
 * @param {string} price - The mint price
 * @returns {Object} - Warp object
 */
function nftMintTemplate(nftContractAddress, price) {
  return {
    name: "NFT Minting",
    title: "Mint an NFT",
    description: "Mint a unique NFT from this collection",
    preview: "https://media.multiversx.com/tokens/nft.png",
    actions: [
      {
        type: "contract",
        label: "Mint NFT",
        description: "Purchase and mint your NFT",
        address: nftContractAddress,
        func: "mint",
        args: [],
        value: price,
        gasLimit: 15000000,
        inputs: [
          {
            name: "Quantity",
            description: "Number of NFTs to mint",
            type: "uint32",
            position: "arg:1",
            source: "field",
            required: true,
          }
        ]
      }
    ]
  };
}

/**
 * Template for a custom contract call
 * @param {string} contractAddress - The smart contract address
 * @param {string} functionName - The function to call
 * @param {Array} args - The arguments for the function
 * @param {string} value - The EGLD value to send
 * @returns {Object} - Warp object
 */
function customContractTemplate(contractAddress, functionName, args, value) {
  return {
    name: "Custom Contract Call",
    title: "Execute Smart Contract",
    description: "Execute a custom function on a smart contract",
    actions: [
      {
        type: "contract",
        label: "Execute",
        description: `Call the ${functionName} function on the smart contract`,
        address: contractAddress,
        func: functionName,
        args: args,
        value: value || "0",
        gasLimit: 10000000
      }
    ]
  };
}

/**
 * Template for simple EGLD transfer
 * @param {string} receiverAddress - The receiver's address
 * @param {string} amount - The amount to transfer in EGLD
 * @returns {Object} - Warp object
 */
function transferTemplate(receiverAddress, amount) {
  return {
    name: "EGLD Transfer",
    title: "Send EGLD",
    description: "Send EGLD to a recipient address",
    preview: "https://media.multiversx.com/tokens/asset_egld.svg",
    actions: [
      {
        type: "transfer",
        label: "Send EGLD",
        description: `Send ${amount} EGLD to ${receiverAddress}`,
        destination: receiverAddress,
        value: amount,
        gasLimit: 50000,
        inputs: [
          {
            name: "Amount",
            description: "Amount to send in EGLD",
            type: "biguint",
            position: "value",
            source: "field",
            required: true
          },
          {
            name: "Receiver",
            description: "Recipient address",
            type: "address",
            position: "destination",
            source: "field",
            required: true
          }
        ]
      }
    ]
  };
}

/**
 * Template for NFT transfer
 * @param {string} receiverAddress - The receiver's address
 * @param {string} tokenId - The token identifier
 * @param {string} nonce - The token nonce (hex format)
 * @returns {Object} - Warp object
 */
function nftTransferTemplate(receiverAddress, tokenId, nonce) {
  return {
    name: "NFT Transfer",
    title: "Send NFT",
    description: "Send an NFT to a recipient address",
    preview: "https://media.multiversx.com/tokens/nft-transfer.png",
    actions: [
      {
        type: "nft",
        label: "Send NFT",
        description: `Send NFT ${tokenId} to ${receiverAddress}`,
        destination: receiverAddress,
        token: tokenId,
        nonce: nonce,
        quantity: 1,
        gasLimit: 400000,
        inputs: [
          {
            name: "Receiver",
            description: "Recipient address",
            type: "address",
            position: "destination",
            source: "field",
            required: true
          },
          {
            name: "Quantity",
            description: "Number of NFTs to send",
            type: "uint32",
            position: "quantity",
            source: "field",
            required: true
          }
        ]
      }
    ]
  };
}

/**
 * Template for external link action
 * @param {string} label - The link label
 * @param {string} url - The URL to link to
 * @param {string} description - The link description
 * @returns {Object} - Warp object
 */
function linkTemplate(label, url, description) {
  return {
    name: "External Link",
    title: label,
    description: description,
    preview: "https://media.multiversx.com/tokens/link.png",
    actions: [
      {
        type: "link",
        label: label,
        description: description,
        url: url
      }
    ]
  };
}

/**
 * Template for multi-swap operation (swap and stake in one warp)
 * @param {string} dexAddress - The DEX contract address
 * @param {string} stakingAddress - The staking contract address
 * @param {string} amount - The amount to swap and stake
 * @returns {Object} - Warp object
 */
function multiSwapAndStakeTemplate(dexAddress, stakingAddress, amount) {
  return {
    name: "Swap and Stake",
    title: "Swap EGLD for Token and Stake",
    description: "Swap EGLD for a token and automatically stake it",
    preview: "https://media.multiversx.com/tokens/swap-stake.png",
    actions: [
      {
        type: "contract",
        label: "Swap EGLD",
        description: "Exchange EGLD for tokens",
        address: dexAddress,
        func: "swapTokensFixedInput",
        args: [
          `token:EGLD`,
          `token:MEX`,
          `biguint:1` // Min amount out
        ],
        value: amount,
        gasLimit: 20000000,
        next: "stake"
      },
      {
        type: "contract",
        label: "Stake Tokens",
        description: "Stake the tokens you received",
        address: stakingAddress,
        func: "stake",
        args: [],
        value: "0",
        gasLimit: 15000000,
        transfers: [
          {
            token: "MEX",
            amount: "output:1" // Use the output from the previous action
          }
        ]
      }
    ]
  };
}

/**
 * Template for a voting action on a DAO
 * @param {string} daoAddress - The DAO contract address
 * @param {string} proposalId - The proposal ID to vote on
 * @param {boolean} voteValue - True for yes, false for no
 * @returns {Object} - Warp object
 */
function daoVoteTemplate(daoAddress, proposalId, voteValue) {
  return {
    name: "DAO Voting",
    title: "Vote on Proposal",
    description: "Cast your vote on a governance proposal",
    preview: "https://media.multiversx.com/tokens/dao.png",
    actions: [
      {
        type: "contract",
        label: "Cast Vote",
        description: `Vote ${voteValue ? 'YES' : 'NO'} on Proposal #${proposalId}`,
        address: daoAddress,
        func: "vote",
        args: [
          `u64:${proposalId}`,
          `bool:${voteValue}`
        ],
        value: "0",
        gasLimit: 10000000,
        inputs: [
          {
            name: "Proposal ID",
            description: "ID of the proposal to vote on",
            type: "uint64",
            position: "arg:1",
            source: "field",
            required: true
          },
          {
            name: "Vote",
            description: "Your vote (Yes/No)",
            type: "boolean",
            position: "arg:2",
            source: "field",
            required: true
          }
        ]
      }
    ]
  };
}

/**
 * Template for a custom styled warp
 * @param {string} name - The warp name
 * @param {string} title - The warp title
 * @param {string} description - The warp description
 * @param {Array} actions - The actions to include
 * @param {Object} style - The custom style settings
 * @returns {Object} - Warp object
 */
function customStyledTemplate(name, title, description, actions, style) {
  return {
    protocol: "warp:0.5.0",
    name: name,
    title: title,
    description: description,
    preview: style.previewImage || "https://media.multiversx.com/tokens/default.png",
    style: {
      primaryColor: style.primaryColor || "#3498db",
      secondaryColor: style.secondaryColor || "#2ecc71",
      fontFamily: style.fontFamily || "Roboto, sans-serif",
      borderRadius: style.borderRadius || "10px"
    },
    actions: actions
  };
}

// Pre-defined action templates that can be used in custom warps
const actionTemplates = {
  transfer: (destination, amount) => ({
    type: "transfer",
    label: "Send EGLD",
    description: `Send ${amount} EGLD to ${destination}`,
    destination: destination,
    value: amount,
    gasLimit: 50000
  }),
  
  contract: (address, func, args, value, gasLimit) => ({
    type: "contract",
    label: func.charAt(0).toUpperCase() + func.slice(1).replace(/([A-Z])/g, ' $1'),
    description: `Call ${func} function on contract`,
    address: address,
    func: func,
    args: args,
    value: value,
    gasLimit: gasLimit || 10000000
  }),
  
  nft: (destination, tokenId, nonce, quantity) => ({
    type: "nft",
    label: "Send NFT",
    description: `Send ${quantity} NFT(s) to ${destination}`,
    destination: destination,
    token: tokenId,
    nonce: nonce,
    quantity: quantity,
    gasLimit: 400000
  }),
  
  link: (label, url, description) => ({
    type: "link",
    label: label,
    description: description,
    url: url
  })
};

// Export all the templates and helpers
module.exports = {
  stakingTemplate,
  lendingTemplate,
  borrowingTemplate,
  swapTemplate,
  nftMintTemplate,
  customContractTemplate,
  transferTemplate,
  nftTransferTemplate,
  linkTemplate,
  multiSwapAndStakeTemplate,
  daoVoteTemplate,
  customStyledTemplate,
  actionTemplates
}; 