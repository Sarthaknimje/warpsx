#!/usr/bin/env node
const readline = require('readline');
const { processPrompt, previewWarp } = require('./warpAgent');

// Create readline interface for CLI
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Main function to run the CLI
async function main() {
  console.log('\n🌟 =============================================== 🌟');
  console.log('🚀  MultiversX AI Warp Generator - Hackathon Edition');
  console.log('🌟 =============================================== 🌟');
  console.log('\nCreate blockchain transactions with natural language!');
  console.log('\nExamples:');
  console.log('  - "Stake 10 EGLD with validator erd123..."');
  console.log('  - "I want to lend 100 USDC to earn interest"');
  console.log('  - "Borrow 500 USDC with 2 EGLD as collateral"');
  console.log('  - "Swap 1 EGLD for USDC at the best rate"');
  console.log('  - "Mint an NFT for 0.5 EGLD from collection X"');
  console.log('\nCommands:');
  console.log('  preview - Preview a warp without deploying');
  console.log('  exit    - Exit the application');
  console.log('🌟 =============================================== 🌟\n');
  
  askForPrompt();
}

// Ask the user for a prompt
function askForPrompt() {
  rl.question('\n💬 Enter your prompt (or "exit" to quit): ', async (prompt) => {
    if (prompt.toLowerCase() === 'exit') {
      console.log('\n👋 Goodbye! Thank you for using MultiversX AI Warp Generator.');
      rl.close();
      return;
    }
    
    if (prompt.toLowerCase() === 'preview') {
      askForPreviewPrompt();
      return;
    }
    
    // Ask for an optional alias
    rl.question('🏷️  Enter an alias for your Warp (optional): ', async (alias) => {
      alias = alias.trim() || null;
      
      try {
        console.log('\n🔄 Creating your Warp...');
        console.log('⚙️  Analyzing your prompt with AI...');
        
        const result = await processPrompt(prompt, alias);
        
        // Handle the result structure which might have deploymentResult
        const deploymentData = result.deploymentResult || result;
        
        console.log('\n✅ Warp created successfully!');
        console.log(`📋 Transaction Hash: ${deploymentData.txHash}`);
        
        if (deploymentData.alias) {
          console.log(`🏷️  Alias: ${deploymentData.alias}`);
        }
        
        if (deploymentData.aliasError) {
          console.log(`⚠️  Alias Registration Error: ${deploymentData.aliasError}`);
          console.log('   Using transaction hash link instead.');
        }
        
        console.log(`\n🔗 Shareable Link: ${deploymentData.link}`);
        
        if (deploymentData.qrCode && typeof deploymentData.qrCode === 'string') {
          console.log('\nScan this QR code to access your Warp:');
          console.log(deploymentData.qrCode);
        }
        
        console.log('\n📱 Share this link or QR code with anyone to let them execute the transaction!');
        console.log('🌐 You can view your Warp at the link above.');
        
        if (deploymentData.txHash) {
          console.log('\n🔍 Check your transaction status:');
          console.log(`   https://devnet-explorer.multiversx.com/transactions/${deploymentData.txHash}`);
        }
      } catch (error) {
        console.error('\n❌ Error creating Warp:', error.message);
        
        // Provide more helpful error messages
        if (error.message.includes('wallet')) {
          console.log('\n💡 Wallet Error Tips:');
          console.log('   - Check that your wallet keystore file exists at the path specified in .env');
          console.log('   - Verify that your wallet password is correct');
          console.log('   - Ensure your wallet has sufficient EGLD for transaction fees');
        } else if (error.message.includes('transaction')) {
          console.log('\n💡 Transaction Error Tips:');
          console.log('   - Check your network connection');
          console.log('   - Verify that the MultiversX devnet is operational');
          console.log('   - Ensure your wallet has sufficient EGLD for transaction fees');
        }
      }
      
      // Ask for another prompt
      askForPrompt();
    });
  });
}

// Ask for a prompt to preview
function askForPreviewPrompt() {
  rl.question('\n💬 Enter a prompt to preview: ', async (prompt) => {
    try {
      console.log('\n🔄 Generating preview...');
      console.log('⚙️  Analyzing your prompt with AI...');
      
      const result = await previewWarp(prompt);
      const preview = result.warp || result;
      const intentData = result.intentData || {};
      
      console.log('\n📝 Warp Preview:');
      console.log('=================');
      console.log(`Name: ${preview.name}`);
      console.log(`Title: ${preview.title}`);
      console.log(`Description: ${preview.description || 'None'}`);
      
      console.log('\nActions:');
      preview.actions.forEach((action, index) => {
        console.log(`\n[Action ${index + 1}]`);
        console.log(`Type: ${action.type}`);
        console.log(`Label: ${action.label}`);
        console.log(`Description: ${action.description || 'None'}`);
        
        if (action.type === 'contract') {
          console.log(`Contract: ${action.address}`);
          console.log(`Function: ${action.func}`);
          console.log(`Value: ${action.value || '0'} EGLD`);
          if (action.args && action.args.length > 0) {
            console.log(`Arguments: ${JSON.stringify(action.args)}`);
          }
          if (action.transfers && action.transfers.length > 0) {
            console.log(`Transfers: ${JSON.stringify(action.transfers)}`);
          }
        } else if (action.type === 'transfer') {
          console.log(`Receiver: ${action.receiver}`);
          console.log(`Token: ${action.token}`);
          console.log(`Amount: ${action.amount}`);
        }
      });
      
      console.log('\n✅ This is what your Warp will look like when deployed.');
    } catch (error) {
      console.error('\n❌ Error generating preview:', error.message);
    }
    
    // Ask for another prompt
    askForPrompt();
  });
}

// Start the CLI
main().catch(error => {
  console.error('Error running the application:', error);
  process.exit(1);
}); 