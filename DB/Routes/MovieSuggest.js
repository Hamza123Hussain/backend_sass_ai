import express from 'express'
import { MovieController } from '../Controllers/MovieSuggest.js'

const MovieRouter = express.Router()

MovieRouter.post('/', MovieController)

export default MovieRouter
