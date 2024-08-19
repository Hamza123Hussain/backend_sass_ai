import { doc, setDoc } from 'firebase/firestore'
import { v4 as uuid } from 'uuid'
import { db } from '../../Firebase.js'
import { chatSessions } from '../../GemniConfig.js'
import { SummaryPromp } from '../Prompts/Summary.js'

export const SummaryController = async (req, res) => {
  const RandomID = uuid() // Unique ID for the summary document
  try {
    const { SummaryTask, UserEmail, UserID } = req.body

    // Validate required fields
    if (!SummaryTask || !UserEmail || !UserID) {
      return res
        .status(400)
        .json({ error: 'SummaryTask, UserEmail, and UserID are required' })
    }

    // Ensure UserEmail is properly formatted for Firestore paths
    const sanitizedUserEmail = UserEmail.replace(/[@.]/g, '_')

    // Save the original task and UserEmail
    const originalDocRef = doc(
      db,
      'Summary',
      sanitizedUserEmail,
      'UserTasks',
      UserID
    )
    await setDoc(originalDocRef, {
      MessageID: uuid(),
      Message: SummaryTask,
      ID: UserID, // Ensure ID is unique and valid
    })

    // Generate the summary using Gemini AI
    const Gemni_Response = await chatSessions.sendMessage(
      SummaryPromp(SummaryTask)
    )
    console.log('Gemini Response:', Gemni_Response)

    // Check if response is valid text
    const AiResponseText = await Gemni_Response.response.text()
    console.log('AI Response Text:', AiResponseText)

    // Clean and parse the response text
    const cleanedResponse = AiResponseText.trim() // Trim any extra spaces or new lines
    if (!cleanedResponse) {
      return res.status(500).json({ error: 'AI did not generate any text' })
    }

    // Save the generated summary to Firestore
    const summaryDocRef = doc(
      db,
      'Summary',
      sanitizedUserEmail,
      'UserTasks',
      RandomID
    )
    await setDoc(summaryDocRef, {
      MessageID: uuid(),
      Message: cleanedResponse,
      ID: RandomID, // Ensure ID is unique and valid
    })

    // Respond with the summary
    res.status(200).json({
      AI: {
        MessageID: uuid(),
        UserID: RandomID,
        Conversation: cleanedResponse,
        UserEmail: 'IAMROBOT@GEMNI.COM',
      },
      Human: {
        MessageID: uuid(),
        Conversation: SummaryTask,
        UserEmail,
        UserID,
      }, // Include any additional human-related information if needed
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Failed to generate summary' })
  }
}
