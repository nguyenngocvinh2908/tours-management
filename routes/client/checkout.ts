import { Router } from "express"
import * as controller from '../../controllers/client/checkout'

const router: Router = Router()

router.get('/', controller.index)

router.post('/order', controller.orderPost)

router.get('/success/:orderCode', controller.successPage)

router.get('/error', controller.errorPage)

router.get('/check-status/:orderCode', controller.checkOrderStatus)

export const CheckoutRouter: Router = router