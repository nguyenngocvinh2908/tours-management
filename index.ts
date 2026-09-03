import express, { Express } from 'express'
import sequelize from './config/database'
import dotenv from 'dotenv'
import clientRoutes from './routes/client'
import moment from 'moment'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import flash from 'express-flash'

// Setup Env   
dotenv.config()

// Connect Databse
sequelize

const app: Express = express()
const port: Number | String = process.env.PORT || 3000

// Setup Body Parser
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Setup Cookie_Parser
app.use(cookieParser('ABBBBBAAA'))

// Setup Session
app.use(session({
  secret: 'ABBBBBAAA',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 }
}))

// Setup Flash Messages
app.use(flash())

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