# MultiversX Warp Generator Telegram Bot

This guide explains how to set up and use the MultiversX Warp Generator Telegram Bot, which allows users to create MultiversX warps directly from Telegram chats and groups.

## Setting Up the Bot

### 1. Create a Telegram Bot

First, you need to create a Telegram bot and get a token:

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Start a chat with BotFather and send the command `/newbot`
3. Follow the instructions to create your bot
4. Once created, BotFather will give you a token (it looks like `123456789:ABCdefGhIJKlmnOPQRstUVwxyz`)
5. Save this token, you'll need it in the next step

### 2. Configure Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```
   cp .env.example .env
   ```

2. Edit the `.env` file and add your Telegram bot token:
   ```
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   ```

3. Make sure all other required environment variables are set correctly (OpenAI API key, MultiversX configuration, etc.)

### 3. Run the Bot

You can run the bot using npm:

```bash
npm run bot
```

For development with auto-restart on code changes:

```bash
npm run dev:bot
```

You should see a message confirming that the bot is running.

## Using the Bot

### Basic Commands

- `/start` - Start the bot and see welcome message
- `/help` - Show help information
- `/warp [prompt]` - Create a warp from your prompt
- `/warp [prompt] alias=[name]` - Create a warp with a custom alias
- `/preview [prompt]` - Preview a warp without creating it
- `/check-alias [name]` - Check if an alias is available

### Example Commands

Here are some example commands you can use with the bot:

```
/warp stake 10 EGLD
/warp swap 1 EGLD for USDC alias=my-swap
/preview lend 100 USDC
/check-alias my-staking-warp
```

### Using in Groups

The bot works in both private chats and group chats. In groups, make sure to use the commands with the `/` prefix.

## Deployment

### Running as a Service

For production deployment, you should run the bot as a service. Here's how to set it up using systemd on Linux:

1. Create a systemd service file:
   ```bash
   sudo nano /etc/systemd/system/warp-telegram-bot.service
   ```

2. Add the following content (adjust paths as needed):
   ```
   [Unit]
   Description=MultiversX Warp Generator Telegram Bot
   After=network.target

   [Service]
   Type=simple
   User=your_username
   WorkingDirectory=/path/to/your/project/ai
   ExecStart=/usr/bin/npm run bot
   Restart=on-failure
   Environment=NODE_ENV=production

   [Install]
   WantedBy=multi-user.target
   ```

3. Enable and start the service:
   ```bash
   sudo systemctl enable warp-telegram-bot
   sudo systemctl start warp-telegram-bot
   ```

4. Check the status:
   ```bash
   sudo systemctl status warp-telegram-bot
   ```

### Using Docker

You can also run the bot using Docker:

1. Build the Docker image:
   ```bash
   docker build -t warp-telegram-bot -f Dockerfile.bot .
   ```

2. Run the container:
   ```bash
   docker run -d --name warp-bot --env-file .env warp-telegram-bot
   ```

## Troubleshooting

### Bot Not Responding

1. Check if the bot is running:
   ```bash
   ps aux | grep botRunner
   ```

2. Check the logs for errors:
   ```bash
   npm run bot > bot.log 2>&1
   ```

3. Verify your Telegram token is correct

### Error Creating Warps

1. Make sure your MultiversX wallet is properly configured
2. Check that the network (devnet/testnet/mainnet) is correctly set
3. Ensure you have sufficient funds in your wallet for transactions

## Security Considerations

- **Never share your .env file** or expose your Telegram bot token or wallet credentials
- In production, use secure methods to store sensitive information (environment variables, secrets management)
- Consider implementing rate limiting to prevent abuse
- Add user authentication for sensitive operations if needed

## Support

If you encounter any issues or have questions, please open an issue on the GitHub repository or contact the development team. 