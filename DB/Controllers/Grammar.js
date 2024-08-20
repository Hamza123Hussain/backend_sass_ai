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
        MessageID: uuid(),
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
      let formattedResponse
      try {
        // Attempt to parse JSON array response
        formattedResponse = JSON.parse(AiResponseText)
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError)

        // Handle non-JSON or malformed response
        formattedResponse = [
          {
            RevisedContent: AiResponseText,
            Grammar: 'Unable to parse grammar.',
            Style: 'Unable to parse style.',
            Clarity: 'Unable to parse clarity.',
            Formatting: 'Unable to parse formatting.',
          },
        ]
      }

      // Save the generated Grammar to Firestore
      await setDoc(
        doc(db, 'GrammarSuggest', sanitizedUserEmail, 'Grammar', RandomID),
        {
          MessageID: RandomID,
          Grammar: formattedResponse,
          ID: RandomID, // Ensure ID is unique and valid
        }
      )

      res.status(200).json({
        AI: {
          MessageID: uuid(),
          UserID: RandomID,
          Conversation: formattedResponse,
          UserEmail: 'IAMROBOT@GEMNI.COM',
        },
        Human: {
          MessageID: uuid(),
          Conversation: PostContent,
          UserEmail,
          UserID,
        },
      })
    } else {
      // Handle the case where no Grammar is generated
      res.status(500).json({ error: 'Failed to generate Grammar' })
    }
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Failed to generate Grammar' })
  }
}
