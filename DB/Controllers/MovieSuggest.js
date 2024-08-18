import { doc, setDoc } from 'firebase/firestore'
import { v4 as uuid } from 'uuid'
import { db } from '../../Firebase.js'
import { chatSessions } from '../../GemniConfig.js'

export const MovieController = async (req, res) => {
  const RandomID = uuid() // Unique ID for the document
  try {
    const { MovieTask, UserEmail } = req.body

    // Check if UserEmail is provided
    if (!UserEmail) {
      return res.status(400).json({ error: 'UserEmail is required' })
    }

    // Ensure UserEmail is properly formatted for Firestore paths
    const sanitizedUserEmail = UserEmail.replace(/[@.]/g, '_')

    // Save the original task and UserEmail
    await setDoc(
      doc(db, 'MovieSuggest', sanitizedUserEmail, 'Movie', RandomID),
      {
        Message: MovieTask,
        ID: RandomID, // Ensure ID is unique and valid
      }
    )

    // Define the prompt for generating the Movie
    const MoviePromp = `You are a movie recommendation expert with a deep understanding of various genres and film styles. The user has described their current mood and feelings as: "${MovieTask}". Based on this mood, recommend a selection of movies that match the user's emotional state. Provide the recommendations in an array of objects, with each object containing the following details:

- **Movie Title**: The title of the movie.
- **Director**: The director of the movie.
- **Genre**: The genre of the movie.
- **Release Year**: The year the movie was released.
- **Description**: A brief explanation of why this movie fits the user's mood.
- **Watch URL**: A URL where the user can get more information about the movie.
- **Platform**: The platform or service where the movie is available for streaming or purchase.
- **Platform URL**: The direct link to watch or purchase the movie on the platform.
Just give me the array of movies and no other text.`

    // Generate the Movie using Gemini AI
    const Gemni_Response = await chatSessions.sendMessage(MoviePromp)

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
      res.status(200).json({ Movie: ExplainAiResponse })
    } else {
      // Handle the case where no Movie is generated
      res.status(500).json({ error: 'Failed to generate Movie' })
    }
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Failed to generate Movie' })
  }
}
