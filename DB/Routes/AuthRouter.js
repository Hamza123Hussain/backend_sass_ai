import express from 'express'
import { SignUpController } from '../Controllers/SignUP.js'
import { LoginController } from '../Controllers/Login.js'
import { SignOutController } from '../Controllers/SignOut.js'

const AuthRouter = express.Router()

AuthRouter.post('/', SignUpController)
AuthRouter.post('/Login', LoginController)
AuthRouter.get('/', SignOutController)

export default AuthRouter
