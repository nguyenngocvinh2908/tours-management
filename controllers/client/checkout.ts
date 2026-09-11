import { Request, Response } from 'express'
import CartItem from '../../models/cart-item'
import Tour from '../../models/tour'
import { formatCartData } from '../../helpers/formatCartData'
import { formatVoucherData } from '../../helpers/formatVoucherData'

// [ GET ] "/checkout"
export const index = async (req: Request, res: Response) => {
  try {
    const cartId = req.cookies?.cart_id
    const appliedVoucherCode = req.cookies?.voucher_code

    if(!cartId) {
      res.redirect('/cart')
      return
    }

    // 1. Lấy Danh Sách Tour Trong Giỏ
    const cartItems: any = await CartItem.findAll({
      where: {
        cartId: cartId,
        deleted: false
      },
      include: [
        {
          model: Tour,
          attributes: ['id', 'title', 'slug', 'code', 'images', 'price', 'discount', 'stock']
        }
      ],
    })

    if (!cartItems || cartItems.length === 0) {
      res.redirect('/cart')
      return
    }

    // 2. Sử dụng Helper formatCartData để tính totalPrice và danh sách tour
    const { items, totalQuantity, totalPrice } = formatCartData(cartItems)

    // 3. Kiểm tra lại điều kiện hợp lệ của Voucher từ Cookie
    const { validVoucherCode, discountAmount, finalTotal } = await formatVoucherData(res, items, appliedVoucherCode, totalPrice)

    res.render('client/pages/checkouts/index.pug', {
      titlePage: 'Checkout & Payment',
      cart: {
        items: items,
        totalQuantity: totalQuantity,
        subtotal: totalPrice
      },
      voucherCode: validVoucherCode,
      discountAmount: discountAmount,
      finalTotal: finalTotal
    })

  } catch(error) {
    console.error(error)
    res.redirect('/cart')
  }
}