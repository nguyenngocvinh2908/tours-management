import { Request, Response } from 'express'
import CartItem from '../../models/cart-item'
import Tour from '../../models/tour'
import Order from '../../models/order'
import { formatCartData } from '../../helpers/formatCartData'
import { formatVoucherData } from '../../helpers/formatVoucherData'
import OrderItem from '../../models/order-item'
import sequelize from '../../config/database'

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

// [ POST ] "/order"
export const orderPost = async (req: Request, res: Response) => {
  try {
    const { fullName, phone, email, address, note, paymentMethod } = req.body
    const cartId = req.cookies?.cart_id
    const appliedVoucherCode = req.cookies?.voucher_code

    if(!fullName || !phone || !email || !address) {
      res.json({ code: 400, message: 'Please enter all required information!'})
      return
    }

    // 1. Lấy lại giỏ hàng từ DB để tính toán lại
    const cartItems: any = await CartItem.findAll({
      where: {
        cartId: cartId,
        deleted: false
      },
      include: [
        {
          model: Tour
        }
      ]
    })

    if(cartItems.length === 0) {
      res.json({ code: 400, message: 'Cart Empty!'})
      return
    }
    const { items, totalPrice } = formatCartData(cartItems)
    const { discountAmount, finalTotal} = await formatVoucherData(res, items, appliedVoucherCode, totalPrice)
    // 2. Tạo Mã Code Order
    const orderCode = `ODR${Date.now()}${Math.floor(Math.random() * 1000)}`

    // 2.1 Tạo 1 transaction
    const transaction = await sequelize.transaction()
    try {
      // 3. Tạo Đơn Hàng
      const order: any = await Order.create({
        code: orderCode,
        fullName: fullName,
        phone,
        email,
        address,
        note,
        paymentMethod: paymentMethod || 'cash',
        paymentStatus: 'unpaid',
        status: 'initial',
        discountAmount,
        totalPrice: finalTotal,
        voucherCode: appliedVoucherCode || null
      }, {
        transaction
      })
      
      // 4. Tạo Chi Tiêt Đơn Hàng (OrderItem)
      const orderItemsData = items.map((item: any) => {
        return {
          orderId: order.id,
          tourId: item.tour.id,
          quantity: item.quantity,
          price: item.tour.price,
          discount: item.tour.discount || 0,
          totalPrice: item.totalPrice,
          timeStart: new Date()
        }
      })
      await OrderItem.bulkCreate(orderItemsData, { transaction })

      // 5. Cap Nhat Ton Kho Va Huy Don Hang
      for(const item of items) {
        await Tour.decrement('stock', { by: item?.quantity, where: { id: item?.tour.id }, transaction})
      }
      await CartItem.destroy({ where: { cartId: cartId }, transaction })

      await transaction.commit()

      res.clearCookie('voucher_code')

      res.json({
        code: 200,
        message: 'Order placed successfully!',
        orderCode: orderCode
      })
    } catch {
      await transaction.rollback()
      res.status(500).json({
        code: 500,
        message: 'An error occurred while creating the order!'
      })
    }

  } catch {
    res.status(500).json({ code: 500, message: 'An error occurred while creating the order!' })
  }
}

// [ GET ] "/checkout/success/:orderCode"
export const successPage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderCode } = req.params
    const order: any = await Order.findOne({
      where: { code: orderCode, deleted: false }
    })

    if(!order) {
      const message = encodeURIComponent('Order not found')
      return res.redirect(`/checkout/error?message=${message}`)
    }

    res.render('client/pages/checkouts/success.pug', {
      titlePage: 'Booking Successful',
      order: order
    })
  } catch {
    res.redirect('/checkout/error')
  }
}

// [GET] /checkout/error
export const errorPage = (req: Request, res: Response): void => {
  const errorMessage = (req.query.message as string) || 'Something went wrong during checkout process.'  
  res.render('client/pages/checkouts/error.pug', {
    titlePage: 'Booking Failed',
    message: errorMessage
  })
}