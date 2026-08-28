import express, { Express, Request, Response} from 'express'

const app: Express = express()
const port: Number = 3000

app.get('/tours', (req: Request, res: Response) => {
  res.send('Tours')
})

app.listen(port, () => {
  console.log(`App listenning on port ${port}`)
})

export default app