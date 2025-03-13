// Mock OpenAI client for development
const openaiClient = {
  createCompletion: async () => {
    return {
      data: {
        choices: [
          {
            text: 'This is a mock response from the OpenAI client.'
          }
        ]
      }
    };
  },
  createChatCompletion: async () => {
    return {
      data: {
        choices: [
          {
            message: {
              content: 'This is a mock response from the OpenAI client.'
            }
          }
        ]
      }
    };
  }
};

console.log('OpenAI client initialized with mock implementation');

module.exports = { openaiClient }; 