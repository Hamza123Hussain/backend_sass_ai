import { doc, setDoc } from 'firebase/firestore'
import { v4 as uuid } from 'uuid'
import { db } from '../../Firebase.js'
import { chatSessions } from '../../GemniConfig.js'
import { HashTagPrompt } from '../Prompts/HashTag.js'

export const HashTagController = async (req, res) => {
  const RandomID = uuid() // Unique ID for the document
  try {
    const { PostContent, UserEmail, UserID } = req.body

    if (!UserEmail) {
      return res.status(400).json({ error: 'UserEmail is required' })
    }

    const sanitizedUserEmail = UserEmail.replace(/[@.]/g, '_')

    // Save the original task and UserEmail to Firestore
    await setDoc(
      doc(db, 'HashTagGenerator', sanitizedUserEmail, 'HashTags', UserID),
      {
        MessageID: uuid(),
        Message: PostContent,
        ID: UserID, // Ensure ID is unique and valid
      }
    )

    // Generate the hashtags using Gemini AI
    const Gemni_Response = await chatSessions.sendMessage(
      HashTagPrompt(PostContent)
    )

    // Extract and clean the response text
    const AiResponseText = await Gemni_Response.response.text()

    // Parse the response and format it
    let hashtagsArray
    try {
      // Clean the response text
      const cleanedResponse = AiResponseText.replace(/^\[\s*```\s*/, '') // Remove leading backticks and brackets
        .replace(/```\s*\]$/, '') // Remove trailing backticks and brackets
        .trim()

      // Check if the cleaned response is JSON
      if (cleanedResponse.startsWith('[') && cleanedResponse.endsWith(']')) {
        // Attempt to parse the cleaned response into an array
        hashtagsArray = JSON.parse(cleanedResponse)
      } else {
        // Handle cases where the response is not valid JSON
        hashtagsArray = cleanedResponse.split(/\s+/).filter(Boolean)
      }

      // Ensure the parsed response is an array
      if (!Array.isArray(hashtagsArray)) {
        throw new Error('Parsed response is not an array')
      }
    } catch (parseError) {
      console.error('Error parsing hashtags:', parseError)
      return res.status(500).json({ error: 'Failed to parse hashtags' })
    }

    // Save the generated hashtags to Firestore
    await setDoc(
      doc(db, 'HashTagGenerator', sanitizedUserEmail, 'HashTags', RandomID),
      {
        MessageID: uuid(),
        HashTags: hashtagsArray,
        ID: RandomID, // Ensure ID is unique and valid
      }
    )

    // Respond with the summary
    res.status(200).json({
      AI: {
        MessageID: uuid(),
        UserID: RandomID,
        Conversation: hashtagsArray,
        UserEmail: 'IAMROBOT@GEMNI.COM',
      },
      Human: {
        MessageID: uuid(),
        Conversation: PostContent,
        UserEmail,
        UserID,
      }, // Include any additional human-related information if needed
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Failed to generate hashtags' })
  }
}
