import { Request, Response, NextFunction } from 'express'
import Cart from '../../models/cart'
import CartItem from '../../models/cart-item'

const EXPIRES_TIME = 365 * 24 * 60 * 60 * 1000 // 1 năm

export const cartId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let cartId = req.cookies.cart_id
    if(!cartId) {
      // 1. Nếu ko có Cookie -> Tạo bản ghi Cart mới -> Lưu vào DB -> Lưu cartId vào Cookie
      const cart = await Cart.create()
      cartId = cart.get('id')
      // 1.1 Lưu cartId vào Cookie
      
      res.cookie('cart_id', cartId, { expires: new Date(Date.now() + EXPIRES_TIME), httpOnly: true })
    } else {
      // 2. Nếu có Cookie -> Kiểm tra bản ghi Cart có tồn tại trong DB ko
      const cart = await Cart.findOne({
        where: {
          id: cartId,
          deleted: false
        },
        raw: true
      })
      // Nếu ko tìm thấy trong db -> Tạo bản ghi Cart mới -> Lưu vào DB -> Lưu cartId vào Cookie
      if(!cart) {
        const newCart = await Cart.create()
        cartId = newCart.get('id')
        res.cookie('cart_id', cartId, { expires: new Date(Date.now() + EXPIRES_TIME), httpOnly: true })
      }
    }

    // 3. Tính tổng số lượng tour trong giỏ
    const totalQuantity = await CartItem.sum('quantity', {
      where: {
        cartId: cartId,
        deleted: false
      }
    })
    res.locals.miniCartQuantity = totalQuantity || 0
    
  } catch (e) {
    console.error('Cart Middleware Error:', e)
  }
  next()
}