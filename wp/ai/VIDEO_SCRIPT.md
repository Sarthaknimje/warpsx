# MultiversX AI Warp Generator - Demo Video Script

## Introduction (0:00 - 0:30)

**[Show Title Screen: "MultiversX AI Warp Generator"]**

**Narrator:** "Welcome to the MultiversX AI Warp Generator, an innovative tool that allows anyone to create blockchain transactions using natural language. Today, we'll demonstrate how this tool bridges the gap between complex blockchain operations and everyday users."

**[Show Problem Statement Screen]**

**Narrator:** "Blockchain transactions are complex and technical, requiring specialized knowledge. MultiversX Warps are powerful, but creating them requires understanding JSON schemas and contract calls. Our solution makes this process accessible to everyone."

## Overview (0:30 - 1:00)

**[Show Application Interface]**

**Narrator:** "The MultiversX AI Warp Generator uses artificial intelligence to understand natural language prompts and convert them into Warps - on-chain data structures that provide all necessary information to construct complex UIs for generating transactions on the MultiversX blockchain."

**Narrator:** "Our tool offers both a command-line interface and a web interface, making it accessible to both developers and non-technical users."

## Demo: CLI Interface (1:00 - 2:30)

**[Show Terminal Window]**

**Narrator:** "Let's start with the command-line interface. We'll run the application using 'npm start'."

**[Run the application]**

**Narrator:** "As you can see, the application provides examples of prompts we can use. Let's try creating a Warp for staking EGLD."

**[Type prompt: "Stake 10 EGLD with validator erd123..."]**

**Narrator:** "Now, let's provide an alias for our Warp to make it easier to share."

**[Type alias: "my-staking"]**

**Narrator:** "The AI is analyzing our prompt, extracting the intent and parameters. It identifies that we want to stake 10 EGLD with a specific validator."

**[Show the Warp creation process]**

**Narrator:** "The Warp has been created and deployed to the blockchain. We now have a transaction hash, an alias, and a shareable link. The application also generates a QR code that can be scanned to access the Warp."

**Narrator:** "Let's try another example, this time for borrowing."

**[Type prompt: "Borrow 500 USDC with 2 EGLD as collateral"]**

**[Show the Warp creation process]**

**Narrator:** "Again, the AI understands our intent and creates a Warp for borrowing USDC with EGLD as collateral."

## Demo: Web Interface (2:30 - 4:00)

**[Switch to Web Browser]**

**Narrator:** "Now, let's look at the web interface, which provides a more user-friendly experience. We'll run the web server using 'npm run web' and navigate to localhost:3000."

**[Show the web interface]**

**Narrator:** "The web interface offers the same functionality as the CLI, but with a more intuitive design. Let's create a Warp for swapping tokens."

**[Type prompt: "Swap 1 EGLD for USDC at the best rate"]**

**Narrator:** "We can also preview a Warp before deploying it to see exactly what will be created."

**[Switch to Preview tab and type prompt: "Mint an NFT for 0.5 EGLD from collection X"]**

**Narrator:** "The preview shows us the Warp that would be created, including the name, title, description, and actions. It also shows us how the AI understood our prompt."

## Using a Generated Warp (4:00 - 4:30)

**[Open a Warp link in the browser]**

**Narrator:** "When someone receives a Warp link or scans the QR code, they see a user interface that allows them to execute the transaction with one click. All the complex details are handled behind the scenes."

**[Show the Warp UI]**

**Narrator:** "This makes it incredibly easy for anyone to interact with the MultiversX blockchain, even if they have no technical knowledge."

## Technical Explanation (4:30 - 5:30)

**[Show Architecture Diagram]**

**Narrator:** "Behind the scenes, our application uses several components:
1. The user interface, which can be either CLI or web-based
2. AI processing, which analyzes the prompt and extracts intent
3. Warp creation, which uses templates to create the Warp
4. Deployment, which creates and signs the transaction
5. Registration, which registers the Warp with an alias
6. Link and QR code generation, which creates shareable links"

**Narrator:** "We use the MultiversX SDK and Warps SDK to interact with the blockchain, and we've implemented a mock mode for demonstrations that doesn't require actual blockchain transactions."

## Use Cases and Potential (5:30 - 6:00)

**[Show Use Cases Screen]**

**Narrator:** "The MultiversX AI Warp Generator has numerous use cases:
- Non-technical users can create complex blockchain transactions
- DeFi platforms can provide easy onboarding for new users
- Businesses can create shareable payment links
- NFT creators can distribute mint links
- Validators can create staking links for their community"

## Conclusion (6:00 - 6:30)

**[Show Final Screen]**

**Narrator:** "The MultiversX AI Warp Generator represents a significant step forward in making blockchain technology accessible to everyone. By combining AI with the power of MultiversX Warps, we've created a tool that bridges the gap between complex blockchain operations and everyday users."

**Narrator:** "Thank you for watching our demo. We're excited about the potential of this technology and look forward to your feedback."

**[Show Contact Information and GitHub Repository]** 