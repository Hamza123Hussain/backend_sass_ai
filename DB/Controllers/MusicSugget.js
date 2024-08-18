import { doc, setDoc } from 'firebase/firestore'
import { v4 as uuid } from 'uuid'
import { db } from '../../Firebase.js'
import { chatSessions } from '../../GemniConfig.js'

export const MusicController = async (req, res) => {
  const RandomID = uuid() // Unique ID for the document
  try {
    const { MusicTask, UserEmail } = req.body

    // Check if UserEmail is provided
    if (!UserEmail) {
      return res.status(400).json({ error: 'UserEmail is required' })
    }

    // Ensure UserEmail is properly formatted for Firestore paths
    const sanitizedUserEmail = UserEmail.replace(/[@.]/g, '_')

    // Save the original task and UserEmail
    await setDoc(
      doc(db, 'MusicSuggest', sanitizedUserEmail, 'Music', RandomID),
      {
        Message: MusicTask,
        ID: RandomID, // Ensure ID is unique and valid
      }
    )

    // Define the prompt for generating the Music recommendations
    const MusicPromp = `
    You are a music recommendation expert with extensive knowledge of various genres and artists. The user has described their current mood and feelings as: "${MusicTask}". Based on this mood, recommend a selection of songs that match the user's emotional state. Provide the recommendations in an array of objects, with each object containing the following details:
    
    - **Song Title**: The title of the song.
    - **Artist**: The artist or band who performed the song.
    - **Genre**: The genre of the song.
    - **Album**: The album in which the song appears (if applicable).
    - **Description**: A brief explanation of why this song fits the user's mood.
    - **Listen URL**: A URL where the user can listen to the song.`

    // Generate the Music recommendations using Gemini AI
    const Gemni_Response = await chatSessions.sendMessage(MusicPromp)

    const AiResponse = Gemni_Response.response.text()

    // Parse the response from Gemini AI
    const parsedResponse = JSON.parse(AiResponse)

    if (parsedResponse) {
      // Save the generated Music recommendations to Firestore
      await setDoc(
        doc(db, 'MusicSuggest', sanitizedUserEmail, 'Music', RandomID),
        {
          Music: parsedResponse,
          ID: RandomID, // Ensure ID is unique and valid
        }
      )

      // Respond with the Music recommendations
      res.status(200).json({ Music: parsedResponse })
    } else {
      // Handle the case where no Music recommendations are generated
      res
        .status(500)
        .json({ error: 'Failed to generate Music recommendations' })
    }
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Failed to generate Music recommendations' })
  }
}
