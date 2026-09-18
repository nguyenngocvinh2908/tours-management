import { Router } from "express"
import * as controller from '../../controllers/client/user'
import * as auth from '../../middlewares/client/auth'

const router: Router = Router()

router.get('/register', auth.checkGuest, controller.register)

router.post('/register', auth.checkGuest, controller.registerPost)

router.get('/login', auth.checkGuest, controller.login)

router.post('/login', auth.checkGuest, controller.loginPost)


export const UserRouter: Router = router