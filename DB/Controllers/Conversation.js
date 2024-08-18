import { doc, setDoc } from 'firebase/firestore'
import { v4 as uuid } from 'uuid'
import { db } from '../../Firebase.js'
import { chatSessions } from '../../GemniConfig.js'
import { ConvoPrompt } from '../Prompts/ConvoPrompt.js'

export const ConvoController = async (req, res) => {
  const RandomID = uuid() // Unique ID for the document
  try {
    const { Conversation, UserEmail, UserID } = req.body

    if (!UserEmail) {
      return res.status(400).json({ error: 'UserEmail is required' })
    }

    const sanitizedUserEmail = UserEmail.replace(/[@.]/g, '_')

    // Save the original task and UserEmail to Firestore
    await setDoc(
      doc(db, 'ConvoGenerator', sanitizedUserEmail, 'Conversation', UserID),
      {
        Message: Conversation,
        ID: UserID, // Ensure ID is unique and valid
      }
    )

    // Generate the Conversation using Gemini AI
    const Gemni_Response = await chatSessions.sendMessage(
      ConvoPrompt(Conversation)
    )

    // Extract and clean the response text
    const AiResponseText = await Gemni_Response.response.text()

    // Save the generated Conversation to Firestore
    await setDoc(
      doc(db, 'ConvoGenerator', sanitizedUserEmail, 'Conversation', RandomID),
      {
        Message: AiResponseText,
        ID: RandomID, // Ensure ID is unique and valid
      }
    )

    // Respond with the clean array of Conversation
    res
      .status(200)
      .json({
        Conversation,
        UserEmail,
        UserID,
        GPTID: RandomID,
        AiResponseText,
      })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Failed to generate Conversation' })
  }
}
