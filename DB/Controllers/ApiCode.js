import { doc, setDoc } from 'firebase/firestore'
import { v4 as uuid } from 'uuid'
import { db } from '../../Firebase.js'
import { chatSessions } from '../../GemniConfig.js'

export const CodeController = async (req, res) => {
  const RandomID = uuid() // Unique ID for the code and explanation document
  try {
    const { codetask, UserEmail } = req.body

    // Check if UserEmail is provided
    if (!UserEmail) {
      return res.status(400).json({ error: 'UserEmail is required' })
    }

    // Ensure UserEmail is properly formatted for Firestore paths
    const sanitizedUserEmail = UserEmail.replace(/[@.]/g, '_')

    // Save the original task and UserEmail
    await setDoc(
      doc(db, 'CodeGenerator', sanitizedUserEmail, 'UserTasks', RandomID),
      {
        Message: codetask,
        ID: RandomID, // Ensure ID is unique and valid
      }
    )

    // Define the prompt for generating code
    const CodePrompt = `
    You are a highly experienced programmer with extensive knowledge in various programming languages. 
    The user has provided the following task: "${codetask}". 
    Your task is to generate a professional and correctly formatted code snippet that fulfills this requirement. 
    Please provide only the code as your response. Do not include any additional text or explanations. 
    Make sure the code is well-structured and follows best practices.`

    // Generate the code using Gemini AI
    const Gemni_Response = await chatSessions.sendMessage(CodePrompt)
    const CodeAiResponse = Gemni_Response.response.text()

    // Check if the code response is valid
    if (CodeAiResponse) {
      // Define the prompt for generating explanation
      const ExplainPrompt = `
      You have provided the following code for the task: "${codetask}":
      ${CodeAiResponse}
      Please provide a detailed explanation of how the code works. 
      Explain each part of the code clearly and why it is implemented in that way. 
      The explanation should help users understand the logic and functionality of the code.`

      // Generate the explanation using Gemini AI
      const Gemni_Response2 = await chatSessions.sendMessage(ExplainPrompt)
      const ExplainAiResponse = Gemni_Response2.response.text()

      // Check if the explanation response is valid
      if (ExplainAiResponse) {
        // Save the code and explanation to Firestore
        await setDoc(
          doc(db, 'CodeGenerator', sanitizedUserEmail, 'UserTasks', RandomID),
          {
            code: CodeAiResponse,
            explanation: ExplainAiResponse,
            ID: RandomID, // Ensure ID is unique and valid
          }
        )

        // Respond with the code and explanation
        res
          .status(200)
          .json({ code: CodeAiResponse, explanation: ExplainAiResponse })
      } else {
        // Handle the case where no explanation is generated
        res.status(500).json({ error: 'Failed to generate explanation' })
      }
    } else {
      // Handle the case where no code is generated
      res.status(500).json({ error: 'Failed to generate code' })
    }
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Failed to generate code and explanation' })
  }
}
