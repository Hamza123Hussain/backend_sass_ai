// Define the prompt for generating explanation
export const ExplainPrompt = (codetask, CodeAiResponse) => {
  return `
      You have provided the following code for the task: "${codetask}":
      ${CodeAiResponse}
      Please provide a detailed explanation of how the code works. 
      Explain each part of the code clearly and why it is implemented in that way. 
      The explanation should help users understand the logic and functionality of the code.`
}
