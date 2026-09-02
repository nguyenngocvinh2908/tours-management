import { Express } from 'express'
import { TourRouter } from './tour'
import { CategoryRouter } from './category'
import { SearchRouter } from './search'

const clientRoutes = (app: Express) => {
  app.use('/tours', TourRouter)

  app.use('/categories', CategoryRouter)

  app.use('/search', SearchRouter)
}

export default clientRoutes