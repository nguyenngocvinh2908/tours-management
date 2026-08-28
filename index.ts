import express, { Express, Request, Response} from 'express'
import sequelize from './config/database'
import dotenv from 'dotenv'

// Setup Env
dotenv.config()
// Connect Databse
sequelize

const app: Express = express()
const port: Number | String = process.env.PORT || 3000

// Setup Pug
app.set("views", './views')
app.set("view engine", "pug")

app.get('/tours', (req: Request, res: Response) => {
  res.render('client/pages/tours/index')
})

app.listen(port, () => {
  console.log(`App listenning on port ${port}`)
})

export default app