// Vercel Serverless Function Adapter for Express
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
const appDir = path.join(process.cwd(), 'wp');
const envPath = path.join(appDir, '.env.production');

// Try to load production environment variables
if (fs.existsSync(envPath)) {
  console.log('Loading environment from:', envPath);
  dotenv.config({ path: envPath });
} else {
  console.log('No .env.production file found, using default environment variables');
  // If no .env.production file, set some defaults
  process.env.NODE_ENV = 'production';
  process.env.MOCK_MODE = 'false';
  process.env.MULTIVERSX_CHAIN_ID = 'D';
  process.env.MULTIVERSX_API_URL = 'https://devnet-api.multiversx.com';
  process.env.MULTIVERSX_GATEWAY_URL = 'https://devnet-gateway.multiversx.com';
}

// Update environment path for the serverless function
process.env.PATH_TO_APP = appDir;

// Make sure require statements find modules in our app directory
module.paths.push(path.join(appDir, 'node_modules'));

// Load the actual server.js file from our app
const { app } = require(path.join(appDir, 'src/server'));

// Export the serverless function handler
module.exports = app; 