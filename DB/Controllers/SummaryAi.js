import { doc, setDoc } from 'firebase/firestore'
import { v4 as uuid } from 'uuid'
import { db } from '../../Firebase.js'
import { chatSessions } from '../../GemniConfig.js'
import { SummaryPromp } from '../Prompts/Summary.js'

export const SummaryController = async (req, res) => {
  const RandomID = uuid() // Unique ID for the summary document
  try {
    const { SummaryTask, UserEmail } = req.body

    // Check if UserEmail is provided
    if (!UserEmail) {
      return res.status(400).json({ error: 'UserEmail is required' })
    }

    // Ensure UserEmail is properly formatted for Firestore paths
    const sanitizedUserEmail = UserEmail.replace(/[@.]/g, '_')

    // Save the original task and UserEmail
    await setDoc(
      doc(db, 'Summary', sanitizedUserEmail, 'UserTasks', RandomID),
      {
        Message: SummaryTask,
        ID: RandomID, // Ensure ID is unique and valid
      }
    )

    // Define the prompt for generating the summary

    // Generate the summary using Gemini AI
    const Gemni_Response = await chatSessions.sendMessage(
      SummaryPromp(SummaryTask)
    )

    // Log the raw response for debugging
    console.log('Gemini Response:', Gemni_Response)

    // Check if response is valid text
    const AiResponseText = await Gemni_Response.response.text()
    console.log('AI Response Text:', AiResponseText)

    // Clean and parse the response text
    const cleanedResponse = AiResponseText.trim() // Trim any extra spaces or new lines
    let ExplainAiResponse
    try {
      ExplainAiResponse = cleanedResponse
    } catch (parseError) {
      console.error('Failed to clean response:', parseError)
      return res.status(500).json({ error: 'Invalid response format from AI' })
    }

    if (ExplainAiResponse) {
      // Save the generated summary to Firestore
      await setDoc(
        doc(db, 'Summary', sanitizedUserEmail, 'UserTasks', RandomID),
        {
          Summary: ExplainAiResponse,
          ID: RandomID, // Ensure ID is unique and valid
        }
      )

      // Respond with the summary
      res.status(200).json({ Summary: ExplainAiResponse })
    } else {
      // Handle the case where no summary is generated
      res.status(500).json({ error: 'Failed to generate summary' })
    }
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Failed to generate summary' })
  }
}
