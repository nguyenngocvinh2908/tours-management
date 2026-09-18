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
