import { doc, setDoc } from 'firebase/firestore'
import { v4 as uuid } from 'uuid'
import { db } from '../../Firebase.js'
import { chatSessions } from '../../GemniConfig.js'
import { MoviePromp } from '../Prompts/Movie.js'

export const MovieController = async (req, res) => {
  const RandomID = uuid() // Unique ID for the document
  try {
    const { MovieTask, UserEmail, UserID } = req.body

    // Check if UserEmail is provided
    if (!UserEmail) {
      return res.status(400).json({ error: 'UserEmail is required' })
    }

    // Ensure UserEmail is properly formatted for Firestore paths
    const sanitizedUserEmail = UserEmail.replace(/[@.]/g, '_')

    // Save the original task and UserEmail
    await setDoc(doc(db, 'MovieSuggest', sanitizedUserEmail, 'Movie', UserID), {
      Message: MovieTask,
      ID: UserID, // Ensure ID is unique and valid
    })

    // Generate the Movie using Gemini AI
    const Gemni_Response = await chatSessions.sendMessage(MoviePromp(MovieTask))

    // Log the raw response for debugging
    console.log('Gemini Response:', Gemni_Response)

    // Check if response is valid JSON
    const AiResponseText = await Gemni_Response.response.text()
    console.log('AI Response Text:', AiResponseText)

    // Remove unnecessary formatting and parse JSON
    const cleanedResponse = AiResponseText.replace(/```json\n|\n```/g, '') // Remove code block markers
    let ExplainAiResponse
    try {
      ExplainAiResponse = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      return res.status(500).json({ error: 'Invalid response format from AI' })
    }

    if (ExplainAiResponse) {
      // Save the generated Movie to Firestore
      await setDoc(
        doc(db, 'MovieSuggest', sanitizedUserEmail, 'Movie', RandomID),
        {
          Movie: ExplainAiResponse,
          ID: RandomID, // Ensure ID is unique and valid
        }
      )

      // Respond with the Movie
      res
        .status(200)
        .json({
          MovieTask,
          UserEmail,
          UserID,
          GPTID: RandomID,
          Movie: ExplainAiResponse,
        })
    } else {
      // Handle the case where no Movie is generated
      res.status(500).json({ error: 'Failed to generate Movie' })
    }
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Failed to generate Movie' })
  }
}
