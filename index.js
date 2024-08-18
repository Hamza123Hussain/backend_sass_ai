import express from 'express'
import { Port } from './Config.js'
import cors from 'cors'
import CodeRouter from './DB/Routes/CodeRoute.js'
import SummaryRouter from './DB/Routes/SummaryRoute.js'
import MusicRouter from './DB/Routes/MusicSuggestRoute.js'
import MovieRouter from './DB/Routes/MovieSuggest.js'
import HashTagRouter from './DB/Routes/HashTagRoute.js'
import GrammarRouter from './DB/Routes/Grammar.js'
import ConvoRouter from './DB/Routes/ConvoRouter.js'
import AuthRouter from './DB/Routes/AuthRouter.js'

const App = express()

App.use(express.json())
App.use(cors())
App.use('/api/Code', CodeRouter)
App.use('/api/Summary', SummaryRouter)
App.use('/api/Music', MusicRouter)
App.use('/api/Movie', MovieRouter)
App.use('/api/HashTag', HashTagRouter)
App.use('/api/Grammar', GrammarRouter)
App.use('/api/General', ConvoRouter)
App.use('/api/Auth', AuthRouter)
App.listen(Port, () => {
  console.log(`RUNNING ON ${Port}`)
})
