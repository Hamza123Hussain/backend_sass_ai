import express from 'express'
import { MusicController } from '../Controllers/MusicSugget.js'

const MusicRouter = express.Router()

MusicRouter.post('/', MusicController)

export default MusicRouter
