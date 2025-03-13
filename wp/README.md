# WarpX - MultiversX Warp Generator

<div align="center">
  <h3>WarpX : Create blockchain transactions with natural language</h3>
  <p>Generate shareable links and QR codes for MultiversX blockchain transactions</p>
  
  <div>
    <a href="https://warpx-unified.vercel.app" target="_blank">Visit WarpX</a> •
    <a href="https://t.me/WarpX_bot" target="_blank">Telegram Bot</a>
  </div>
</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Features](#-features)
- [Installation](#-installation)
- [Usage](#-usage)
- [Deployment](#-deployment)
- [Technologies](#-technologies)
- [License](#-license)

## 🚀 Overview

WarpX is an AI-powered platform that simplifies blockchain interactions on the MultiversX network. Using natural language prompts, users can create complex blockchain transactions without needing to understand the technical details.

The project consists of two main components:
1. **Web Application** - A comprehensive platform with both informational landing page and functional warp generation interface
2. **Telegram Bot** - For creating warps directly through Telegram messaging

WarpX is built for the MultiversX Hackathon and aims to make blockchain technology more accessible to everyone.

## 🏗️ Architecture

The WarpX system architecture follows this workflow:

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│   User Input  │────▶│  NLP Parser   │────▶│ Intent Mapper │
│  (Web/Telegram)│     │ (Prompt → Intent)│  │(Intent → Action)│
└───────────────┘     └───────────────┘     └───────┬───────┘
                                                   │
┌───────────────┐     ┌───────────────┐     ┌──────▼───────┐
│  QR Generator │◀────│  Warp Link    │◀────│ Transaction  │
│  (Shareable)  │     │  Generator    │     │  Builder     │
└───────┬───────┘     └───────┬───────┘     └───────┬──────┘
        │                     │                     │
        └─────────────┬───────┴─────────────┬──────┘
                      │                     │
               ┌──────▼─────────────────────▼──────┐
               │             MultiversX             │
               │            Blockchain              │
               └────────────────────────────────────┘
```

1. **User Input**: Users input natural language commands via web or Telegram
2. **NLP Parser**: The system parses the natural language to understand the intent
3. **Intent Mapper**: Maps the parsed intent to specific blockchain actions
4. **Transaction Builder**: Creates the appropriate blockchain transaction
5. **Warp Link Generator**: Creates a shareable link for the transaction
6. **QR Generator**: Generates a QR code that can be scanned to execute the transaction

The application is structured into the following directories:
- `/ai` - Main application backend and web interface
- `/src` - Core warp generation logic

## ✨ Features

- **Natural Language Processing**: Create transactions using plain English
- **Multiple Interfaces**: Web app, CLI, and Telegram bot
- **Shareable Warp Links**: Generate links that anyone can use to execute your transactions
- **QR Codes**: Share transactions via scannable QR codes
- **Alias System**: Create memorable aliases for your warps
- **Direct Contract Interaction**: Specify direct contract calls for advanced users
- **Batch Processing**: Create multiple warps at once
- **Real-time Alias Checking**: Verify alias availability as you type
- **MultiversX Explorer Integration**: View transactions directly on the blockchain explorer
- **Responsive Design**: Works on mobile, tablet, and desktop

## 🔧 Installation

### Prerequisites
- Node.js (v16+)
- npm or yarn
- MultiversX wallet (for creating transactions)

### Local Setup

1. Clone the repository:
```bash
git clone https://github.com/Sarthaknimje/warpx.git
cd warpx
```

2. Install dependencies:
```bash
# Main application
cd ai
npm install
```

3. Create environment files:
```bash
# In the ai directory
cp .env.example .env
```

4. Configure your .env file with your MultiversX wallet details and API keys.

5. Start the application:
```bash
# Start the web application
cd ai
npm run web
```

6. Access the application:
   - Web app: http://localhost:3000

## 📱 Usage

### Web Interface

1. Visit the [WarpX web app](https://warpx-unified.vercel.app)
2. Explore the landing page to learn about features and functionality
3. Click "Launch App" to access the warp generator
4. Enter a natural language prompt (e.g., "stake 10 EGLD")
5. Optionally add an alias for your warp
6. Click "Generate Warp"
7. Share the generated link or QR code

### Telegram Bot

1. Open Telegram and search for [@WarpX_bot](https://t.me/WarpX_bot)
2. Start a conversation with the bot
3. Send a natural language prompt
4. The bot will return a warp link and QR code

### Command Line

```bash
cd ai
npm start "stake 10 EGLD" --alias my-staking-warp
```

## 🌐 Deployment

The unified web application is deployed on Vercel:

- **WarpX Application**: [https://warpx-unified.vercel.app](https://warpx-unified.vercel.app)

To deploy your own instance:

1. Create a Vercel account
2. Install Vercel CLI: `npm install -g vercel`
3. Login to Vercel: `vercel login`
4. Deploy the application:
```bash
# Main application
cd ai
vercel deploy --prod
```

5. Set up environment variables in the Vercel dashboard

## 💻 Technologies

### Backend
- Node.js
- Express
- EJS templates
- @multiversx/sdk-core
- @vleap/warps

### Frontend
- EJS templates with CSS
- Bootstrap 5

### Tools & Infrastructure
- Vercel (Deployment)
- QR Code generation
- Telegram Bot API

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ for the MultiversX Hackathon by Sarthak Nimje 
