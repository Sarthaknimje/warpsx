# Warp Generator

A web application for generating MultiversX Warps from natural language prompts. This tool allows users to create blockchain transactions and actions through simple text commands.

## Features

- Natural language processing to convert user prompts into blockchain actions
- Support for various transaction types (transfers, staking, swaps, etc.)
- Batch creation of multiple warps
- Local storage of created warps
- QR code generation for easy sharing
- Alias registration for memorable warp links

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MultiversX wallet (for non-mock mode)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/warp-generator.git
   cd warp-generator
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure your environment:
   - Copy `.env.example` to `.env`
   - Update the configuration values in `.env`

4. Start the application:
   ```
   npm run web
   ```

## Usage

1. Enter a natural language prompt describing the action you want to perform
2. Optionally provide an alias for your warp
3. Click "Generate Warp" to create your warp
4. Share the generated link or QR code

### Example Prompts

- "Stake 1 EGLD with validator erd1..."
- "Send 0.5 EGLD to erd1..."
- "Swap 10 USDC for EGLD"
- "Vote yes on DAO proposal #5"

## Configuration

The application can be configured through the `config.js` file or environment variables:

- `MOCK_MODE`: Set to true to use mock transactions instead of real ones
- `CHAIN_API_URL`: The MultiversX API endpoint
- `CLIENT_URL`: The Warp client URL
- `WALLET_PEM_PATH`: Path to your wallet PEM file

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [MultiversX SDK](https://github.com/multiversx/mx-sdk-js)
- [Warp SDK](https://github.com/vleap-io/warps) 