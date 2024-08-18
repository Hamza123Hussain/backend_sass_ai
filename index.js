import express from 'express'
import { Port } from './Config.js'
import cors from 'cors'
import CodeRouter from './DB/Routes/CodeRoute.js'
import SummaryRouter from './DB/Routes/SummaryRoute.js'

const App = express()

App.use(express.json())
App.use(cors())
App.use('/api/Code', CodeRouter)
App.use('/api/Summary', SummaryRouter)
App.listen(Port, () => {
  console.log(`RUNNING ON ${Port}`)
})
