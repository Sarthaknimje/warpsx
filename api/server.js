// Vercel Serverless Function Adapter for Express
const path = require('path');
const fs = require('fs');

// Set up the correct working directory paths
const appDir = path.join(process.cwd());
// Update environment path for the serverless function
process.env.PATH_TO_APP = appDir;

// Make sure require statements find modules in our app directory
module.paths.push(path.join(appDir, 'node_modules'));

// Load the actual server.js file from our app
const { app } = require(path.join(appDir, 'src/server'));

// Export the serverless function handler
module.exports = app; 