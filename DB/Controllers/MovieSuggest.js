import { doc, setDoc } from 'firebase/firestore'
import { v4 as uuid } from 'uuid'
import { db } from '../../Firebase.js'
import { chatSessions } from '../../GemniConfig.js'
import { MoviePrompt } from '../Prompts/Movie.js'

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
      MessageID: uuid(),
      Message: MovieTask,
      ID: UserID, // Ensure ID is unique and valid
    })

    // Generate the Movie recommendations using Gemini AI
    const prompt = MoviePrompt(MovieTask)
    console.log('Prompt:', prompt)

    const Gemini_Response = await chatSessions.sendMessage(prompt)

    // Log the raw response for debugging
    console.log('Gemini Response:', Gemini_Response)

    // Check if response is valid JSON
    const AiResponseText = await Gemini_Response.response.text()
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

    // Validate and filter the response
    if (Array.isArray(ExplainAiResponse)) {
      const validMovies = ExplainAiResponse.filter((movie) => {
        // Validate URL and image
        const isValidURL = (url) => {
          try {
            new URL(url)
            return true
          } catch {
            return false
          }
        }

        return (
          movie.Platform &&
          ['Prime Video', 'Netflix'].includes(movie.Platform) &&
          isValidURL(movie.WatchURL) &&
          (!movie.PosterImage || isValidURL(movie.PosterImage))
        )
      })

      // Save the generated Movie recommendations to Firestore
      await setDoc(
        doc(db, 'MovieSuggest', sanitizedUserEmail, 'Movie', RandomID),
        {
          MessageID: uuid(),
          Message: validMovies,
          ID: RandomID, // Ensure ID is unique and valid
        }
      )

      // Respond with the Movie recommendations
      res.status(200).json({
        AI: {
          MessageID: uuid(),
          UserID: RandomID,
          Conversation: validMovies,
          UserEmail: 'IAMROBOT@GEMNI.COM',
        },
        Human: {
          MessageID: uuid(),
          Conversation: MovieTask,
          UserEmail,
          UserID,
        }, // Include any additional human-related information if needed
      })
    } else {
      // Handle the case where no valid Movie recommendations are generated
      res
        .status(500)
        .json({ error: 'Failed to generate valid Movie recommendations' })
    }
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Failed to generate Movie recommendations' })
  }
}
