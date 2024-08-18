import { doc, setDoc } from 'firebase/firestore'
import { v4 as uuid } from 'uuid'
import { db } from '../../Firebase.js'

export const CodeController = async (req, res) => {
  const RandomID = uuid()
  try {
    const { codetask } = req.body
    const CodePrompt = `Read the ${codetask} for the description that I have given for the blog. Just give me the Title in plain string and do not include any symbols, just alphanumeric, that you think is the best for the Blog and no other text, just one single title.`

    // Generate the blog title using Gemini AI
    const Gemni_Response = await chatSessions.sendMessage(CodePrompt)
    const CodeAiResponse = Gemni_Response.response.text()
    await setDoc(doc(db, 'CodeGenerator', RandomID), { message: '' })
    res.status(200).json(true)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Failed to generate code' })
  }
}
