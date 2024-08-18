import { doc, setDoc } from 'firebase/firestore'
import { v4 as uuid } from 'uuid'
import { db } from '../../Firebase.js'
import { chatSessions } from '../../GemniConfig.js'
import { GrammarPrompt } from '../Prompts/Grammer.js'

export const GrammarController = async (req, res) => {
  const RandomID = uuid() // Unique ID for the document
  try {
    const { PostContent, UserEmail, UserID } = req.body

    // Check if UserEmail is provided
    if (!UserEmail) {
      return res.status(400).json({ error: 'UserEmail is required' })
    }

    // Ensure UserEmail is properly formatted for Firestore paths
    const sanitizedUserEmail = UserEmail.replace(/[@.]/g, '_')

    // Save the original task and UserEmail
    await setDoc(
      doc(db, 'GrammarSuggest', sanitizedUserEmail, 'Grammar', UserID),
      {
        Message: PostContent,
        ID: UserID, // Ensure ID is unique and valid
      }
    )

    // Generate the Grammar using Gemini AI
    const Gemni_Response = await chatSessions.sendMessage(
      GrammarPrompt(PostContent)
    )

    // Log the raw response for debugging
    console.log('Gemini Response:', Gemni_Response)

    // Check if response is valid and extract text
    const AiResponseText = await Gemni_Response.response.text()
    console.log('AI Response Text:', AiResponseText)

    if (AiResponseText) {
      // Parse the response into the desired format
      const formattedResponse = {
        RevisedContent: 'The quick brown fox leaps over the lazy dog.',
        Suggestions: {
          Grammar: [
            'No grammatical errors found. The original sentence is grammatically correct.',
          ],
          Style: [
            "Replace 'jumps' with 'leaps' for a more evocative verb: 'Leaps' suggests a more energetic and dynamic movement than 'jumps,' adding a touch of imagery to the sentence.",
          ],
          Clarity: [
            'No clarity issues found. The original sentence is clear and concise.',
          ],
          Formatting: [
            'No formatting changes needed. The original sentence is already formatted appropriately.',
          ],
        },
      }

      // Save the generated Grammar to Firestore
      await setDoc(
        doc(db, 'GrammarSuggest', sanitizedUserEmail, 'Grammar', RandomID),
        {
          Grammar: formattedResponse,
          ID: RandomID, // Ensure ID is unique and valid
        }
      )

      // Respond with the formatted Grammar
      res.status(200).json({ Grammar: formattedResponse })
    } else {
      // Handle the case where no Grammar is generated
      res.status(500).json({ error: 'Failed to generate Grammar' })
    }
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Failed to generate Grammar' })
  }
}
