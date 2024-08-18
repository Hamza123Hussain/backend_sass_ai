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
      // Clean the response text (remove surrounding backticks and extra newlines)
      const cleanedResponse = AiResponseText.replace(/^\[\s*```/, '') // Remove opening array and backticks
        .replace(/```[\s]*\]$/, '') // Remove closing backticks and array
        .trim()

      // Parse the cleaned response into an array
      hashtagsArray = JSON.parse(cleanedResponse)

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
        HashTags: hashtagsArray,
        ID: RandomID, // Ensure ID is unique and valid
      }
    )

    // Respond with the clean array of hashtags
    res
      .status(200)
      .json({
        PostContent,
        UserEmail,
        UserID,
        GPTID: RandomID,
        HashTags: hashtagsArray,
      })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Failed to generate hashtags' })
  }
}
