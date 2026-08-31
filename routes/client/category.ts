import { Router } from "express"
import * as controller from '../../controllers/client/category'

const router: Router = Router()

router.get('/', controller.index)

export const CategoryRouter: Router = router