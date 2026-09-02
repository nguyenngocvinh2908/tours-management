import { Router } from "express"
import * as controller from '../../controllers/client/tour'

const router: Router = Router()

router.get('/', controller.index)

router.get('/:slugCategory', controller.toursOfCategory)

router.get('/detail/:slugTour', controller.detail)

export const TourRouter: Router = router
