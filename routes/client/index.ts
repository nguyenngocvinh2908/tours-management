import { Express } from 'express'
import { TourRouter } from './tour'

const clientRoutes = (app: Express) => {
  app.use('/tours', TourRouter)
}

export default clientRoutes