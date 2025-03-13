# MultiversX AI Warp Generator - Usage Guide

This guide will help you create real Warps on the MultiversX devnet using the AI Warp Generator.

## Prerequisites

Before you start, make sure you have:

1. A MultiversX wallet with some devnet EGLD
   - Get devnet EGLD from the [MultiversX Devnet Faucet](https://r3d4.fr/faucet)
   - Export your wallet as a JSON keystore file

2. The keystore file saved in the project directory
   - The file should be named as specified in your `.env` file

3. The correct configuration in your `.env` file:
   ```
   # MultiversX Network Configuration
   MULTIVERSX_NETWORK=devnet
   MULTIVERSX_API_URL=https://devnet-api.multiversx.com

   # Wallet Configuration
   WALLET_KEYSTORE_FILE=./your-keystore-file.json
   WALLET_PASSWORD=your-wallet-password
   WALLET_ADDRESS=your-wallet-address

   # Application Configuration
   MOCK_MODE=false
   ```

## Creating Warps via CLI

1. Start the CLI application:
   ```
   npm start
   ```

2. Enter a natural language prompt describing the Warp you want to create:
   - "Stake 10 EGLD with validator erd123..."
   - "I want to lend 100 USDC to earn interest"
   - "Borrow 500 USDC with 2 EGLD as collateral"
   - "Swap 1 EGLD for USDC at the best rate"
   - "Mint an NFT for 0.5 EGLD from collection X"

3. Optionally, provide an alias for your Warp to make it easier to share.

4. The application will:
   - Analyze your prompt using AI
   - Create a Warp based on your intent
   - Deploy the Warp to the MultiversX devnet
   - Register the alias (if provided)
   - Generate a shareable link and QR code

5. Share the generated link or QR code with anyone to let them execute the transaction.

## Creating Warps via Web Interface

1. Start the web server:
   ```
   npm run web
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. Enter your prompt in the text area and optionally provide an alias.

4. Click "Generate Warp" to create and deploy your Warp.

5. The web interface will display:
   - The transaction hash
   - The alias (if provided)
   - A shareable link
   - A QR code
   - A link to check the transaction status on the explorer

## Previewing Warps

If you want to see what a Warp will look like without deploying it:

### CLI Interface
1. Type `preview` at the prompt
2. Enter your prompt when asked
3. The application will show you the Warp details without deploying it

### Web Interface
1. Click on the "Preview Warp" tab
2. Enter your prompt
3. Click "Preview Warp" to see the details without deploying

## Troubleshooting

If you encounter errors:

1. **Wallet Errors**:
   - Check that your wallet keystore file exists at the path specified in `.env`
   - Verify that your wallet password is correct
   - Ensure your wallet has sufficient EGLD for transaction fees

2. **Transaction Errors**:
   - Check your network connection
   - Verify that the MultiversX devnet is operational
   - Ensure your wallet has sufficient EGLD for transaction fees

3. **Alias Registration Errors**:
   - If alias registration fails, the application will still provide a hash-based link
   - Try a different alias as it might already be taken

## Verifying Your Warps

1. Use the generated link to access your Warp on the MultiversX devnet
2. Check the transaction status on the [MultiversX Devnet Explorer](https://devnet-explorer.multiversx.com/)
3. Share the link with others to let them execute the transaction

## Examples

### Staking EGLD

Prompt: "Stake 10 EGLD with validator erd1qqqqqqqqqqqqqpgqhe8t5jewej0m8pqssj5m2v9u76fphkj37vpsqfz57h"

This will create a Warp that allows anyone to stake 10 EGLD with the specified validator.

### Lending Crypto

Prompt: "I want to lend 100 USDC to earn interest"

This will create a Warp that allows anyone to lend 100 USDC on a lending platform.

### Swapping Tokens

Prompt: "Swap 1 EGLD for USDC at the best rate"

This will create a Warp that allows anyone to swap 1 EGLD for USDC on a DEX.

## Next Steps

- Try creating different types of Warps
- Share your Warps with others
- Explore the MultiversX Warps ecosystem
- Contribute to the project by adding more templates and features 