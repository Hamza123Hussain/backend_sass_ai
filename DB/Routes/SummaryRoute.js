import express from 'express'
import { SummaryController } from '../Controllers/SummaryAi.js'

const SummaryRouter = express.Router()

SummaryRouter.post('/', SummaryController)

export default SummaryRouter
