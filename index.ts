import express, { Express, Request, Response} from 'express'
import sequelize from './config/database'
import dotenv from 'dotenv'
import Tour from './models/tour'

// Setup Env
dotenv.config()
// Connect Databse
sequelize

const app: Express = express()
const port: Number | String = process.env.PORT || 3000

// Setup Pug
app.set("views", './views')
app.set("view engine", "pug")

app.get('/tours', async (req: Request, res: Response) => {
  const tours = await Tour.findAll({ raw: true })
  res.render('client/pages/tours/index', {
    tours: tours
  })
})

app.listen(port, () => {
  console.log(`App listenning on port ${port}`)
})

export default app