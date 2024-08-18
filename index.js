import express from 'express'
import { appId, Port } from './Config.js'
import cors from 'cors'
import CodeRouter from './DB/Routes/CodeRoute.js'
import SummaryRouter from './DB/Routes/SummaryRoute.js'
import MusicRouter from './DB/Routes/MusicSuggestRoute.js'
import MovieRouter from './DB/Routes/MovieSuggest.js'
import HashTagRouter from './DB/Routes/HashTagRoute.js'

const App = express()

App.use(express.json())
App.use(cors())
App.use('/api/Code', CodeRouter)
App.use('/api/Summary', SummaryRouter)
App.use('/api/Music', MusicRouter)
App.use('/api/Movie', MovieRouter)
App.use('/api/HashTag', HashTagRouter)
App.listen(Port, () => {
  console.log(`RUNNING ON ${Port}`)
})
