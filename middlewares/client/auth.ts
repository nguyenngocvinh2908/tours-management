import { Request, Response, NextFunction } from 'express'
import User from '../../models/user'

// 1. Yêu cầu đăng nhập mới được truy cập Route
export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tokenUser = req.cookies.tokenUser

    if(!tokenUser) {
      res.redirect('/user/login')
      return
    }
    
    const user: any = await User.findOne({
      where: {
        tokenUser: tokenUser,
        deleted: false,
        status: 'active'
      },
      attributes: { exclude: ['password']}
    })

    if(!user) {
      res.clearCookie('tokenUser')
      res.redirect('/user/login')
      return
    }
    // Gán Local Cho Bien User
    res.locals.user = user
    next()
  } catch {
    res.redirect('/user/login')
  }
}

// 2. Chặn User đã đăng nhập truy cập lại trang login/register
export const checkGuest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tokenUser = req.cookies.tokenUser

    if (tokenUser) {
      const user = await User.findOne({
        where: {
          tokenUser: tokenUser,
          deleted: false,
          status: 'active',
        }
      });

      // Nếu token hợp lệ -> Đã đăng nhập -> Đẩy về trang chủ
      if (user) {
        res.redirect('/')
        return
      }
    }

    next()
  } catch (error) {
    next()
  }
}

// 3. 
export const infoUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tokenUser = req.cookies.tokenUser

    if (tokenUser) {
      const user = await User.findOne({
        where: {
          tokenUser: tokenUser,
          deleted: false,
          status: 'active',
        },
        attributes: { exclude: ['password'] }
      })

      if (user) {
        res.locals.user = user // Giúp các View Pug (như Header) dùng được biến user
      }
    }

    next()
  } catch {
    next()
  }
}