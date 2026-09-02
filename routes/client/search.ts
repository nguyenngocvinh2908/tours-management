import { Router } from "express"
import * as controller from '../../controllers/client/search'

const router: Router = Router()

router.get('/:type', controller.index)

export const SearchRouter: Router = router