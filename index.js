import express from 'express'
import { Port } from './Config.js'
import cors from 'cors'
import CodeRouter from './DB/Routes/CodeRoute.js'
import SummaryRouter from './DB/Routes/SummaryRoute.js'
import MusicRouter from './DB/Routes/MusicSuggestRoute.js'
import { MovieController } from './DB/Controllers/MovieSuggest.js'

const App = express()

App.use(express.json())
App.use(cors())
App.use('/api/Code', CodeRouter)
App.use('/api/Summary', SummaryRouter)
App.use('/api/Music', MusicRouter)
App.use('/api/Movie', MovieController)
App.listen(Port, () => {
  console.log(`RUNNING ON ${Port}`)
})
