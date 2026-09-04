import { Router } from "express"
import * as controller from '../../controllers/client/cart'

const router: Router = Router()

router.get('/', controller.index)

router.post('/add', controller.addToCart)

export const CartRouter: Router = router