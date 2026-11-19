import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import User from '../../models/user'
import * as generate from '../../helpers/generate'

// [ GET ] /user/register
export const register = async (req: Request, res: Response): Promise<void> => {
  res.render('client/pages/user/register.pug', {
    titlePage: 'Sign Up'
  })
}

// [ POST ] /user/register
export const registerPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password, phone } = req.body

    // 0. Validate Phía Server
    if(!fullName || !fullName.trim()) {
      res.json({ code: 400, message: 'Please enter your full name!'})
      return
    }

    if (!email || !email.trim()) {
      res.json({ code: 400, message: 'Please enter your email!' })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      res.json({ code: 400, message: 'Invalid email format!' })
      return
    }

    if (!password) {
      res.json({ code: 400, message: 'Please enter your password!' })
      return
    }

    if (password.length < 6) {
      res.json({ code: 400, message: 'The password must be at least 6 characters long!' })
      return
    }

    // 1. Kiểm Tra Xem Email Tồn Tại Hay Chưa
    const exitsEmail = await User.findOne({
      where: { email: email, deleted: false }
    })

    if(exitsEmail) {
      res.json({ code: 400, message: 'This email is already in use!'})
      return
    }

    // 2. Băm Password Bằng bcrybt
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // 3. Tạo Token
    const tokenUser = generate.generateRandomString(30)

    // 4. Luu User Vao Databasezz

    await User.create({
      fullName: fullName,
      email: email,
      password: hashedPassword,
      phone: phone || null,
      tokenUser: tokenUser,
      status: 'active',
      role: 'client'
    })

    // 5. Luu Token Vao Cookie Trong 30 Ngay
    res.cookie('tokenUser', tokenUser, {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      httpOnly: true
    })

    res.json({ code: 200, message: 'Account registration successful!', redirectUrl: '/user/login' })
  } catch {
    res.json({ code: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau!' })
    return
  }
}

// [GET] /user/login
export const login = async (req: Request, res: Response): Promise<void> => {
  res.render('client/pages/user/login.pug', {
    titlePage: 'Sign In',
  })
}


// [ POST ] /user/login
export const loginPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    // 0. Validate Phia Server
    if(!email || !email.trim()) {
      res.json({ code: 400, message: 'Please enter your email!'})
      return
    }
    if (!password) {
      res.json({ code: 400, message: 'Vui lòng nhập mật khẩu!' })
      return
    }

    // 1.Check Email And Password
    const user: any = await User.findOne({ where: { email: email.trim(), deleted: false }})
    if(!user) {
      res.json({ code: 400, message: 'Incorrect email or password!'})
      return
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if(!isPasswordValid) {
      res.json({ code: 400, message: 'Incorrect email or password!'})
      return
    }

    // 2. Kiem Tra Trang Thai Tai Khoan
    if(user.status !== 'active') {
      res.json({ code: 400, message: 'Your account has been locked!' })
      return
    }

    // 3. luu Cookie
    res.cookie('tokenUser', user.tokenUser, {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      httpOnly: true
    })

    res.json({ code: 200, message: 'Sign in uccessful!', redirectUrl: '/tours'})

  } catch {
    res.json({ code: 500, message: 'System error, please try again later!'})
  }
}

// [ GET ] /user/logout
export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie("tokenUser")
  res.redirect("/")
}

// [ GET ] /user/profile
export const profile = async (req: Request, res: Response) => {
  res.render('client/pages/user/profile', {
    titlePage: 'Hồ sơ cá nhân',
    currentPath: '/user/profile'
  })
}

// // [ POST ] /user/profile
// export const profilePost = async (req: Request, res: Response) => {
//   try {
//     const userId = res.locals.user.id
//     const { fullName, phone } = req.body

//     if (!fullName || fullName.trim() === '') {
//       return res.redirect('/user/profile')
//     }

//     const updateData: any = {
//       fullName: fullName.trim(),
//       phone: phone ? phone.trim() : null
//     }

//     if (req.file) {
//       // Nếu lưu local Multer: `/uploads/${req.file.filename}`
//       // Nếu lưu Cloudinary: `req.file.path`
//       updateData.avatar = req.file.path
//     }

//     await User.update(updateData, {
//       where: { id: userId }
//     })

//     return res.redirect('/user/profile')
//   } catch (error) {
//     console.error('Update Profile Error:', error)
//     return res.redirect('/user/profile')
//   }
// }

// // [ POST ] /user/change-password
// export const changePasswordPost = async (req: Request, res: Response) => {
//   try {
//     const userId = res.locals.user.id
//     const { currentPassword, newPassword, confirmPassword } = req.body

//     if (!currentPassword || !newPassword || !confirmPassword || newPassword.length < 6 || newPassword !== confirmPassword) {
//       return res.redirect('/user/profile?tab=security')
//     }

//     const user: any = await User.findOne({
//       where: { id: userId, deleted: false }
//     })

//     if (!user) return res.redirect('/user/login')

//     const isMatch = await bcrypt.compare(currentPassword, user.password)
//     if (!isMatch) {
//       return res.redirect('/user/profile?tab=security')
//     }

//     const hashedPassword = await bcrypt.hash(newPassword, 10)
//     await User.update(
//       { password: hashedPassword },
//       { where: { id: userId } }
//     )

//     return res.redirect('/user/profile?tab=security')
//   } catch (error) {
//     console.error('Change Password Error:', error)
//     return res.redirect('/user/profile?tab=security')
//   }
// }