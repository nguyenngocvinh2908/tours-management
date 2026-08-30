import { Router } from "express"
import * as controller from '../../controllers/client/tour'

const router: Router = Router()

router.get('/', controller.index)

export const TourRouter: Router = router
