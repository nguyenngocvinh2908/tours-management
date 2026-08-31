import { Express } from 'express'
import { TourRouter } from './tour'
import { CategoryRouter } from './category'

const clientRoutes = (app: Express) => {
  app.use('/tours', TourRouter)

  app.use('/categories', CategoryRouter)
}

export default clientRoutes