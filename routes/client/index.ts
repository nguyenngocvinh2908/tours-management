import { Express } from 'express'
import { TourRouter } from './tour'
import { CategoryRouter } from './category'
import { SearchRouter } from './search'
import { CartRouter } from './cart'
import { CheckoutRouter } from './checkout'
import { UserRouter } from './user'

import { cartId } from '../../middlewares/client/cart'
import * as auth from '../../middlewares/client/auth'


const clientRoutes = (app: Express) => {
  app.use(cartId)
  
  app.use(auth.infoUser)

  app.use('/user', UserRouter)

  app.use('/tours', TourRouter)

  app.use('/categories', CategoryRouter)

  app.use('/search', SearchRouter)

  app.use('/cart', CartRouter)

  app.use('/checkout', auth.requireAuth , CheckoutRouter)
}

export default clientRoutes