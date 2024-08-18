import express from 'express'
import { HashTagController } from '../Controllers/HashTagGenerator.js'
const HashTagRouter = express.Router()

HashTagRouter.post('/', HashTagController)

export default HashTagRouter
