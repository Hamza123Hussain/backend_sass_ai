import { signInWithEmailAndPassword } from 'firebase/auth'
import { Auth } from '../../Firebase.js'

export const LoginController = async (req, res) => {
  const { email, password } = req.body
  try {
    const UserCredential = await signInWithEmailAndPassword(
      Auth,
      email,
      password
    )

    // Check if UserCredential is successfully obtained
    if (UserCredential && UserCredential.user) {
      // Send the user ID as the response
      return res.status(200).json({ UserID: UserCredential.user.uid })
    }

    // If UserCredential is not valid, send a 404 response
    return res.status(404).json({ message: 'USER NOT REGISTERED' })
  } catch (error) {
    // Handle any errors during sign-in
    console.error('Login error:', error)
    return res
      .status(500)
      .json({ message: 'INTERNAL SERVER ERROR', details: error.message })
  }
}
