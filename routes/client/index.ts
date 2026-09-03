import { Express } from 'express'
import { TourRouter } from './tour'
import { CategoryRouter } from './category'
import { SearchRouter } from './search'
import { CartRouter } from './cart'
import { cartId } from '../../middlewares/client/cart'

const clientRoutes = (app: Express) => {
  app.use(cartId)

  app.use('/tours', TourRouter)

  app.use('/categories', CategoryRouter)

  app.use('/search', SearchRouter)

  app.use('/cart', CartRouter)
}

export default clientRoutes