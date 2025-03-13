#!/bin/bash

# Define the base directory
BASE_DIR="/Users/sarthakchandrashekharnimje/projects/wp/wp"
cd "$BASE_DIR"

# Start the WarpX app (main application)
echo "Starting WarpX main application..."
npm run web &
WARP_PID=$!

# Start the Telegram bot
echo "Starting Telegram bot..."
cd "$BASE_DIR/ai"
npm run bot &
BOT_PID=$!

# Start the landing page
echo "Starting landing page..."
cd "$BASE_DIR/landing"
PORT=8000 npm start &
LANDING_PID=$!

# Return to base directory
cd "$BASE_DIR"

echo "✅ WarpX app running on http://localhost:3000"
echo "✅ Landing page running on http://localhost:8000"
echo "✅ Telegram bot running at @WarpX_bot"
echo ""
echo "Press Ctrl+C to stop all services"

# Trap Ctrl+C to kill all processes
trap "echo 'Stopping all services...'; kill $WARP_PID $BOT_PID $LANDING_PID; exit" INT

# Wait for any process to exit
wait 