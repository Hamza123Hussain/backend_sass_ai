import { signOut } from 'firebase/auth'
import { Auth } from '../../Firebase.js'

export const SignOutController = async (req, res) => {
  try {
    // Sign out the user
    await signOut(Auth)

    // Respond with a success message
    return res.status(200).json({ message: 'Successfully signed out' })
  } catch (error) {
    // Handle any errors during sign-out
    console.error('SignOut error:', error)
    return res
      .status(500)
      .json({ message: 'INTERNAL SERVER ERROR', details: error.message })
  }
}
