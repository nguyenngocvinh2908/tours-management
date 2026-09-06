import express, { Express } from 'express'
import sequelize from './config/database'
import dotenv from 'dotenv'
import clientRoutes from './routes/client'
import moment from 'moment'
import methodOverride from 'method-override'
import cookieParser from 'cookie-parser'

// Setup Env   
dotenv.config()

// Connect Databse
sequelize

const app: Express = express()
const port: Number | String = process.env.PORT || 3000

// Setup Cookies
app.use(cookieParser())

// Setup Body Parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Setup Method Override
app.use(methodOverride('_method'))

// Setup Public
app.use(express.static('public'))

// Setup Pug
app.set("views", './views')
app.set("view engine", "pug")

// Setup Moment
app.locals.moment = moment

// Routes
clientRoutes(app)

app.listen(port, () => {
  console.log(`App listenning on port ${port}`)
})

export default app