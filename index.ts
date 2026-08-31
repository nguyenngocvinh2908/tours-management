import express, { Express } from 'express'
import sequelize from './config/database'
import dotenv from 'dotenv'
import clientRoutes from './routes/client'

// Setup Env   
dotenv.config()

// Connect Databse
sequelize

const app: Express = express()
const port: Number | String = process.env.PORT || 3000

// Setup Public
app.use(express.static('public'))

// Setup Pug
app.set("views", './views')
app.set("view engine", "pug")


// Routes
clientRoutes(app)

app.listen(port, () => {
  console.log(`App listenning on port ${port}`)
})

export default app