#!/bin/bash

# Start the WarpX app
npm start &
WARP_PID=$!

# Start the Telegram bot
# Uncomment the following lines if you have a bot setup
# cd ai
# npm run bot &
# BOT_PID=$!

# Start the landing page
# Uncomment the following lines if you have a landing page setup
# cd landing
# PORT=8000 npm start &
# LANDING_PID=$!

echo "WarpX app running on http://localhost:3000"
echo "Landing page running on http://localhost:8000 (if enabled)"
echo "Telegram bot running at @WarpX_bot (if enabled)"
echo ""
echo "Press Ctrl+C to stop all services"

# Trap Ctrl+C to kill all processes
trap "kill $WARP_PID $BOT_PID $LANDING_PID; exit" INT

# Wait for any process to exit
wait 