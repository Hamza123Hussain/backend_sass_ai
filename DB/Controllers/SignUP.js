import { createUserWithEmailAndPassword } from 'firebase/auth'
import { Auth, db } from '../../Firebase.js'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export const SignUpController = async (req, res) => {
  const { email, password, Name } = req.body

  try {
    // Check if the user already exists
    const userDocRef = doc(db, 'USERS', email)
    const existingUser = await getDoc(userDocRef)

    if (existingUser.exists()) {
      // User already exists
      return res.status(400).json({ message: 'USER ALREADY EXISTS' })
    }

    // Create a new user with email and password
    const UserCredential = await createUserWithEmailAndPassword(
      Auth,
      email,
      password
    )

    // Check if UserCredential is successfully obtained
    if (UserCredential && UserCredential.user) {
      // Set user details in Firestore
      await setDoc(userDocRef, {
        Name,
        email,
        UserID: UserCredential.user.uid,
      })

      // Retrieve and return the user's data
      const userDoc = await getDoc(userDocRef)
      if (userDoc.exists()) {
        return res.status(201).json(userDoc.data())
      } else {
        return res
          .status(404)
          .json({ message: 'User data could not be retrieved' })
      }
    }

    // Handle case where UserCredential is not valid
    return res.status(400).json({ message: 'User registration failed' })
  } catch (error) {
    // Handle any errors during sign-up
    console.error('SignUp error:', error)
    return res
      .status(500)
      .json({ message: 'INTERNAL SERVER ERROR', details: error.message })
  }
}
