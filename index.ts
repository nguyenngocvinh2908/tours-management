import express, { Express } from 'express'
import sequelize from './config/database'
import dotenv from 'dotenv'
import clientRoutes from './routes/client'
import moment from 'moment'
import cookieParser from 'cookie-parser'

// Setup Env   
dotenv.config()

// Connect Databse
sequelize

const app: Express = express()
const port: Number | String = process.env.PORT || 3000

// Setup Cookie_Parser
app.use(cookieParser())

// Setup Public
app.use(express.static('public'))

// Setup Pug
app.set("views", './views')
app.set("view engine", "pug")

// Setup Moment
app.locals.moment = moment

// Setup Body Parser
app.use(express.urlencoded({ extended: true }))

// Routes
clientRoutes(app)

app.listen(port, () => {
  console.log(`App listenning on port ${port}`)
})

export default app