import { Router } from "express"
import * as controller from '../../controllers/client/cart'

const router: Router = Router()

router.get('/', controller.index)

router.post('/add', controller.addToCart)

router.patch('/update-quantity', controller.updateQuantity)

router.delete('/delete/:itemId', controller.deleteItem)

export const CartRouter: Router = router