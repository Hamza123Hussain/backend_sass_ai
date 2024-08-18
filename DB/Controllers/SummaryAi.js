import { doc, setDoc } from 'firebase/firestore'
import { v4 as uuid } from 'uuid'
import { db } from '../../Firebase.js'
import { chatSessions } from '../../GemniConfig.js'

export const SummaryController = async (req, res) => {
  const RandomID = uuid()
  const RandomID2 = uuid()
  try {
    const { SummaryTask, UserID } = req.body

    // Check if UserID is provided
    if (!UserID) {
      return res.status(400).json({ error: 'UserID is required' })
    }

    // Save the original task and UserID
    await setDoc(doc(db, 'Summary', RandomID2), {
      Message: SummaryTask,
      ID: UserID, // Ensure UserID is not undefined
    })

    // Define the prompt for generating the summary
    const SummaryPromp = `
The user has provided the following content: "${SummaryTask}". 
Your task is to generate a concise and accurate summary of this content. 
Make sure to capture the main points and essential details while keeping the summary clear and to the point. 
Please provide only the summary as your response. Do not include any additional text or summaries.`

    // Generate the summary using Gemini AI
    const Gemni_Response = await chatSessions.sendMessage(SummaryPromp)

    const ExplainAiResponse = Gemni_Response.response.text()

    if (ExplainAiResponse) {
      // Save the generated summary to Firestore
      await setDoc(doc(db, 'Summary', RandomID), {
        Summary: ExplainAiResponse,
        ID: UserID, // Ensure UserID is not undefined
      })

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
