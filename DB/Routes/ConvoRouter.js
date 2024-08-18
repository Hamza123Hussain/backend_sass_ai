import express from 'express'
import { ConvoController } from '../Controllers/Conversation.js'

const ConvoRouter = express.Router()

ConvoRouter.post('/', ConvoController)

export default ConvoRouter
