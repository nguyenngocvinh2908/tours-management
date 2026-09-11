import { Router } from "express"
import * as controller from '../../controllers/client/checkout'

const router: Router = Router()

router.get('/', controller.index)

export const CheckoutRouter: Router = router