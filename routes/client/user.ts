import { Router } from "express"
import * as controller from '../../controllers/client/user'
import * as auth from '../../middlewares/client/auth'

const router: Router = Router()

router.get('/register', auth.checkGuest, controller.register)

router.post('/register', auth.checkGuest, controller.registerPost)

router.get('/login', auth.checkGuest, controller.login)

router.post('/login', auth.checkGuest, controller.loginPost)

router.get('/logout', auth.requireAuth, controller.logout)

// [ GET ] /user/profile - Hiển thị trang thông tin cá nhân
router.get('/profile', auth.requireAuth, controller.profile)

// // [ POST ] /user/profile - Cập nhật thông tin cá nhân
// router.post('/profile', auth.requireAuth, controller.profilePost)

// // [ POST ] /user/change-password - Đổi mật khẩu
// router.post('/change-password', auth.requireAuth, controller.changePasswordPost)

export const UserRouter: Router = router