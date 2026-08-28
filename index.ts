import express, { Express, Request, Response} from 'express'

const app: Express = express()
const port: Number = 3000

app.get('/', (req: Request, res: Response) => {
  res.send('Ok')
})

app.listen(port, () => {
  console.log(`App listenning on port ${port}`)
})

export default app