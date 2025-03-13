# MultiversX AI Warp Generator

An innovative AI-powered agent for the MultiversX hackathon that allows anyone to create Warps by simply typing natural language prompts. This tool leverages AI to understand user intent and the MultiversX blockchain's Warp protocol to generate shareable transaction links that are live on the blockchain.

## 🚀 Features

- **AI-Powered Understanding**: Uses advanced natural language processing to understand user intent
- **Natural Language Interface**: Create complex blockchain transactions using simple English
- **QR Code Generation**: Easily share Warps via scannable QR codes
- **Preview Mode**: Preview Warps before deploying them to the blockchain
- **Web Interface**: User-friendly web application for creating Warps
- **Live Blockchain Deployment**: Creates real Warps on the MultiversX devnet
- **Support for Various DeFi Activities**:
  - Staking EGLD
  - Lending crypto assets
  - Borrowing with collateral
  - Swapping tokens
  - Minting NFTs
  - Custom contract calls
- **Custom Aliases**: Register Warps with memorable aliases
- **Shareable Links**: Generate links that can be shared with anyone

## 📋 Requirements

- Node.js v14 or higher
- A MultiversX wallet (keystore file)
- Access to MultiversX devnet (for testing)

## ⚙️ Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure your environment:
   Create a `.env` file with the following variables:
   ```
   # MultiversX Network Configuration
   MULTIVERSX_NETWORK=devnet
   MULTIVERSX_API_URL=https://devnet-api.multiversx.com

   # Wallet Configuration
   WALLET_KEYSTORE_FILE=./path/to/your/keystore.json
   WALLET_PASSWORD=your_wallet_password
   WALLET_ADDRESS=your_wallet_address
   
   # Application Configuration
   MOCK_MODE=false  # Set to true for demo mode without blockchain transactions
   ```

4. Ensure your wallet has sufficient funds on the devnet:
   - Get devnet EGLD from the [MultiversX Devnet Faucet](https://r3d4.fr/faucet)
   - Your wallet needs EGLD to pay for transaction fees

## 🔍 Usage

### CLI Interface

Run the CLI tool:

```
npm start
```

### Web Interface

Run the web server:

```
npm run web
```

Then open your browser and navigate to `http://localhost:3000`

For development with auto-reload:

```
npm run dev:web
```

### Commands

- **Create a Warp**: Enter a natural language prompt describing what you want to do
- **Preview a Warp**: Type `preview` to enter preview mode without deploying
- **Exit**: Type `exit` to quit the application

### Example Prompts

The AI can understand various prompts like:

- "Stake 10 EGLD with validator erd123..."
- "I want to lend 100 USDC to earn interest"
- "Borrow 500 USDC with 2 EGLD as collateral"
- "Swap 1 EGLD for USDC at the best rate"
- "Mint an NFT for 0.5 EGLD from collection X"

## 🧪 Testing

Test your Warps by accessing the generated link at `https://devnet.usewarp.to?warp=your_warp_id` or by scanning the generated QR code. The links are live on the MultiversX devnet and can be shared with anyone.

## 📚 Key Components

- `warpAgent.js` - Core agent that processes prompts and creates Warps
- `aiUtils.js` - AI-powered prompt understanding
- `warpUtils.js` - Utilities for Warp creation and blockchain interaction
- `warpTemplates.js` - Templates for different types of Warps
- `wallet.js` - Handles wallet operations
- `server.js` - Web server for the user interface

## 🔗 Resources

- [MultiversX Warps Documentation](https://docs.multiversx.com/developers/tools/warps)
- [MultiversX API Documentation](https://docs.multiversx.com/developers/apis/api-introduction)
- [Devnet Explorer](https://devnet-explorer.multiversx.com/)

## 💡 Innovation

This project innovates by:

1. **Bridging Natural Language and Blockchain**: Making complex blockchain operations accessible to everyone
2. **AI-Powered Intent Recognition**: Understanding what users want to do without requiring technical knowledge
3. **Instant Shareable Transactions**: Creating ready-to-use transaction links that can be shared anywhere
4. **QR Code Integration**: Making mobile sharing seamless
5. **Preview Functionality**: Allowing users to see what they're creating before deploying
6. **Live Blockchain Integration**: Creating real Warps that are immediately usable on the MultiversX devnet

## 📝 License

MIT 