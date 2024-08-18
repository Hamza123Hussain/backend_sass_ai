import express from 'express'

import { GrammarController } from '../Controllers/Grammar.js'

const GrammarRouter = express.Router()

GrammarRouter.post('/', GrammarController)

export default GrammarRouter
