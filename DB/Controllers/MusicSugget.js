import { doc, setDoc } from 'firebase/firestore'
import { v4 as uuid } from 'uuid'
import { db } from '../../Firebase.js'
import { chatSessions } from '../../GemniConfig.js'
import { MusicPrompt } from '../Prompts/Music.js'

const validateUrl = (url) => {
  return /^https:\/\/(open\.spotify\.com\/track\/|i\.scdn\.co\/image\/)/.test(
    url
  )
}

export const MusicController = async (req, res) => {
  const RandomID = uuid() // Unique ID for the document
  try {
    const { MusicTask, UserEmail, UserID } = req.body

    if (!UserEmail) {
      return res.status(400).json({ error: 'UserEmail is required' })
    }

    const sanitizedUserEmail = UserEmail.replace(/[@.]/g, '_')

    // Save the original task and UserEmail
    await setDoc(doc(db, 'MusicSuggest', sanitizedUserEmail, 'Music', UserID), {
      MessageID: uuid(),
      Message: MusicTask,
      ID: UserID,
    })

    // Generate the Music using Gemini AI
    const prompt = MusicPrompt(MusicTask)
    console.log('Prompt:', prompt)

    const Gemini_Response = await chatSessions.sendMessage(prompt)
    console.log('Gemini_Response:', Gemini_Response)

    const AiResponse = await Gemini_Response.response.text()
    console.log('AI Response Text:', AiResponse)

    // Clean up the response to remove backticks and other unwanted characters
    const cleanResponse = AiResponse.replace(/^\s*```json\s*/, '')
      .replace(/\s*```$/, '')
      .replace(/\\`/g, '')
      .replace(/`/g, '')
      .trim()

    let parsedResponse

    try {
      parsedResponse = JSON.parse(cleanResponse)
    } catch (error) {
      console.error('Error parsing JSON:', error.message)
      console.error('Cleaned Response:', cleanResponse)
      return res
        .status(500)
        .json({ error: 'Received response is not valid JSON' })
    }

    if (Array.isArray(parsedResponse)) {
      const validatedSongs = parsedResponse
        .map((song) => ({
          ...song,
          Listen: validateUrl(song.Listen) ? song.Listen : '',
          Image: validateUrl(song.Image) ? song.Image : '',
        }))
        .filter((song) => song.Listen && song.Image) // Filter out invalid entries

      // Save the validated Music recommendations to Firestore
      await setDoc(
        doc(db, 'MusicSuggest', sanitizedUserEmail, 'Music', RandomID),
        {
          MessageID: uuid(),
          Message: validatedSongs,
          ID: RandomID,
        }
      )

      // Respond with the Music
      res.status(200).json({
        AI: {
          MessageID: uuid(),
          UserID: RandomID,
          Conversation: validatedSongs,
          UserEmail: 'IAMROBOT@GEMNI.COM',
        },
        Human: {
          MessageID: uuid(),
          Conversation: MusicTask,
          UserEmail,
          UserID,
        },
      })
    } else {
      res
        .status(500)
        .json({ error: 'Failed to generate valid Music recommendations' })
    }
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Failed to generate Music recommendations' })
  }
}
