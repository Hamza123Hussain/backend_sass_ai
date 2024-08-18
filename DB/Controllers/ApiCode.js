import { doc, setDoc } from 'firebase/firestore'
import { v4 as uuid } from 'uuid'
import { db } from '../../Firebase.js'
import { chatSessions } from '../../GemniConfig.js'
import { CodePrompt } from '../Prompts/Code.js'

export const CodeController = async (req, res) => {
  const RandomID = uuid() // Unique ID for the code and explanation document
  try {
    const { codetask, UserEmail, UserID } = req.body

    // Check if UserEmail is provided
    if (!UserEmail) {
      return res.status(400).json({ error: 'UserEmail is required' })
    }

    // Ensure UserEmail is properly formatted for Firestore paths
    const sanitizedUserEmail = UserEmail.replace(/[@.]/g, '_')

    // Save the original task and UserEmail
    await setDoc(
      doc(db, 'CodeGenerator', sanitizedUserEmail, 'UserTasks', UserID),
      {
        Message: codetask,
        ID: UserID, // Ensure ID is unique and valid
      }
    )
    // Generate the code using Gemini AI
    const codeResponse = await chatSessions.sendMessage(CodePrompt(codetask))
    const code = await codeResponse.response.text()

    // Check if the explanation response is valid
    if (code) {
      // Save the code and explanation to Firestore
      await setDoc(
        doc(db, 'CodeGenerator', sanitizedUserEmail, 'UserTasks', RandomID),
        {
          code: code,
          ID: RandomID, // Ensure ID is unique and valid
        }
      )

      // Respond with the formatted code and explanation
      res.status(200).json({
        code: code,
      })
    } else {
      // Handle the case where no explanation is generated
      res.status(500).json({ error: 'Failed to generate explanation' })
    }
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Failed to generate code and explanation' })
  }
}
