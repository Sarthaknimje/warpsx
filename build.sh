#!/bin/bash

# Print current directory
echo "Current directory: $(pwd)"

# Check if wp/landing directory exists
if [ -d "wp/landing" ]; then
  echo "wp/landing directory exists"
else
  echo "wp/landing directory does not exist"
  exit 1
fi

# Navigate to wp/landing directory
cd wp/landing || exit 1
echo "Changed to directory: $(pwd)"

# Install dependencies
echo "Installing landing page dependencies..."
npm install

# Build the landing page
echo "Building landing page..."
npm run build

# Navigate back to root
cd ../..
echo "Changed back to directory: $(pwd)"

# Navigate to wp directory
cd wp || exit 1
echo "Changed to wp directory: $(pwd)"

# Install dependencies
echo "Installing main app dependencies..."
npm install

echo "Build process completed successfully!" 