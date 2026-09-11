import { Request, Response } from 'express'
import CartItem from '../../models/cart-item'
import Tour from '../../models/tour'
import Voucher from '../../models/voucher'
import { formatCartData } from '../../helpers/formatCartData'
import { formatVoucherData } from '../../helpers/formatVoucherData'


// [ GET ]: /cart
export const index = async (req: Request, res: Response) => {
  try {
    const cartId = req.cookies.cart_id
    const appliedVoucherCode = req.cookies?.voucher_code

    // Lấy danh sách cartItem
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
      ]
    })

    const { items, totalPrice, totalQuantity } = formatCartData(cartItems)

    // 2. Tự Động Tính Số Tiền Giảm Nếu Có Cookie voucher_code
    const { validVoucherCode, discountAmount, finalTotal } = await formatVoucherData(res, items, appliedVoucherCode, totalPrice)

    res.render('client/pages/carts/index.pug', {
      titlePage: 'My Cart',
      cart: {
        items: items,
        totalQuantity: totalQuantity,
        totalPrice: totalPrice
      },
      voucherCode: validVoucherCode,
      discountAmount: discountAmount,
      finalTotal: finalTotal
    })
  } catch(e) {
    console.log(e)
    res.redirect('/')
  }
}

// [ POST ]: /cart/add
export const addToCart = async (req: Request, res: Response) => {
  try {
    const cartId = req.cookies.cart_id
    const tourId = parseInt(req.body.tourId, 10)
    const quantity = parseInt(req.body.quantity, 10) || 1

    const exitsItem: any = await CartItem.findOne({
      where: {
        cartId: cartId,
        tourId: tourId,
        deleted: false
      }
    })

    if(exitsItem) {
      const newQuantity = (exitsItem.get('quantity') as number) + quantity
      await exitsItem.update({ quantity: newQuantity })
    } else {
      await CartItem.create({
        cartId: cartId,
        tourId: tourId,
        quantity: quantity
      })
    }

    // Tính Lại Tổng Số Lượng Trong Giỏ
    const totalQuantity = await CartItem.sum('quantity', {
      where: {
        cartId: cartId,
        deleted: false
      }
    }) || 0

    res.json({
      code: 200,
      message: "Successfully added to cart!",
      totalQuantity: totalQuantity
    })
  } catch {
    res.status(500).json({
      code: 500,
      message: "Failed to add to cart!"
    })
  }
}

// [ PATCH ]: /cart/update-quantity
export const updateQuantity = async (req: Request, res: Response): Promise<void> => {
  try {
    const cartId = req.cookies.cart_id
    const { itemId, quantity } = req.body

    const parsedQuantity = parseInt(quantity, 10)

    if(!itemId || isNaN(parsedQuantity) || parsedQuantity < 1) {
      res.status(400).json({ code: 400, message: 'Invalid quantity!' })
      return
    }

    const cartItem: any = await CartItem.findOne({
      where: {
        id: itemId,
        cartId: cartId,
        deleted: false
      },
      include: [
        {
          model: Tour,
          attributes: ['id', 'price', 'discount', 'stock']
        }
      ]
    })

    if(!cartItem) {
      res.status(404).json({ code: 404, message: 'The product does not exist in the cart!' })
      return
    }

    const tour = cartItem.Tour || cartItem.tour

    // 2. Check Stock Of Tour
    if(tour && parsedQuantity > tour.stock) {
      res.status(400).json({ 
        code: 400, 
        message: `Tour is stock ${tour.stock}` 
      })
      return
    }

    // 3.Update Quantity
    cartItem.quantity = parsedQuantity
    await cartItem.save()

    // 4. Update Total Amount
    const allCartItems: any = await CartItem.findAll({
      where: {
        cartId: cartId,
        deleted: false
      },
      include: [
        {
          model: Tour,
          attributes: ['price', 'discount']
        }
      ]
    })

    let newTotalPrice = 0
    let newTotalQuantity = 0

    allCartItems.forEach((item: any) => {
      const itemTour = item.Tour || item.tour
      if(itemTour) {
        const priceSpecial = itemTour.discount ? Math.round(itemTour.price * (1 - itemTour.discount / 100)) : itemTour.price
        newTotalPrice += priceSpecial * item.quantity
      }
      newTotalQuantity+= item.quantity
    })

    const currentCartItemPriceSpecial = tour.discount ? Math.round(tour.price * (1 - tour.discount / 100)) : tour.price
    res.json({
      code: 200,
      message: 'Update Successful!',
      itemTotalPrice: currentCartItemPriceSpecial * parsedQuantity,
      totalPrice: newTotalPrice,
      totalQuantity: newTotalQuantity
    })
  } catch(e) {
    console.error('Error Update Quantity', e)
    res.status(500).json({ code: 500, message: 'Error Server' })
  }
}

// [ DELETE ]: /cart/delete/:itemId
export const deleteItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const cartId = parseInt(req.cookies.cart_id, 10)
    const itemId = parseInt(String(req.params.itemId), 10)

    console.log(cartId, itemId)

    const cartItem: any = await CartItem.findOne({
      where: {
        id: itemId,
        cartId: cartId,
        deleted: false
      }
    })

    if(!cartItem) {
      res.status(404).json({ code: 404, message: "Tour is not exist"})
      return
    }

    // Xóa Mềm
    await cartItem.update({ deleted: true })

    // Tính Lại Tổng Tiền Sau Khi Xóa
    const remainingItems: any = await CartItem.findAll({
      where: {
        cartId: cartId,
        deleted: false
      },
      include: [
        {
          model: Tour,
          attributes: ['price', 'discount']
        }
      ],
    })

    let newTotalPrice = 0;
    let newTotalQuantity = 0;

    remainingItems.forEach((item: any) => {
      const itemTour = item.Tour || item.tour
      if (itemTour) {
        const priceSpecial = itemTour.discount ? Math.round(itemTour.price * (1 - itemTour.discount / 100)) : itemTour.price
        newTotalPrice += priceSpecial * item.quantity
      }
      newTotalQuantity += item.quantity
    });

    res.json({
      code: 200,
      message: 'Deleted Item In Cart',
      totalPrice: newTotalPrice,
      totalQuantity: newTotalQuantity,
      cartEmpty: remainingItems.length === 0
    })
  } catch(error) {
    console.error('Error DeleteItem:', error);
    res.status(500).json({ code: 500, message: 'Error Server' });
  }

}

// [ POST ]: /cart/apply-voucher
export const applyVoucher = async (req: Request, res: Response): Promise<void> => {
  try {
    const { voucherCode } = req.body
    const cartId = req.cookies.cart_id

    if (!voucherCode) {
      res.status(400).json({ code: 400, message: 'Please enter the discount code!' });
      return
    }

    if(!cartId) {
      res.status(400).json({ code: 400, message: 'The shopping cart does not exist!' })
      return
    }

    // Truy Van Xem Code Co Ton Tai
    const voucher: any = await Voucher.findOne({
      where: {
        code: voucherCode.toUpperCase(),
        status: 1
      }
    })

    if(!voucher) {
      res.json({ code: 400, message: 'The discount code is invalid or has been locked!' })
      return
    }

    // 2. Kiem Tra Stock
    if(voucher.stock <= 0) {
      res.json({ code: 400, message: 'This discount code has run out of uses!' })
      return
    }

    // 3. Kuem Tra Ngay Het Han
    const nowDate = new Date()
    if(voucher.startDate && new Date(voucher.startDate) > nowDate) {
      res.json({ code: 400, message: 'The discount code is not yet valid for use!' })
      return
    }

    if(voucher.endDate && new Date(voucher.endDate) < nowDate) {
      res.json({ code: 400, message: 'The discount code has expired!' })
      return
    }

    // 4. Lay Tong Tien Tam Tinh
    const cartItems: any = await CartItem.findAll({
      where: {
        cartId: cartId,
        deleted: false
      },
      include: [
        {
          model: Tour,
          attributes: ['price', 'discount']

        }
      ]
    })

    if(!cartItems || cartItems.length === 0) {
      res.json({ code: 400, message: 'Your shopping cart is empty!' })
      return
    }

    let subtotal = 0
    cartItems.forEach((item: any) => {
      const tour = item.Tour || item.tour
      const priceSpecial = tour.discount ? Math.round(tour.price * (1 - tour.discount / 100)) : tour.price
      subtotal += priceSpecial * item.quantity
    })

    // 5. Check Gia Tri Don Hang Toi Thieu
    if(voucher.minOrderValue && subtotal < voucher.minOrderValue) {
      const formattedMin = new Intl.NumberFormat('vi-VN').format(voucher.minOrderValue)
      res.json({
        code: 400,
        message: `Đơn hàng tối thiểu phải đạt ${formattedMin}đ để áp dụng mã này!`
      })
      return
    }

    // 6. Tinh Tong So Tien Giam
    let discountAmount = 0
    if(voucher.discountType === 'percent') {
      discountAmount = Math.round((subtotal * voucher.discountValue) / 100)
    } else discountAmount = voucher.discountValue
      // Gioi Han Muc Giam
    if(voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
      discountAmount = voucher.maxDiscount
    }

    // Đảm Bảo Số Tiền Ko Vượt Quá Tổng Tiền Đơn Hàng
    if(discountAmount > subtotal) discountAmount = subtotal

    const totalPrice = subtotal - discountAmount

    // Lưu Vào Cookies Để Dùng Khi Checkout
    res.cookie('voucher_code', voucher.code, { httpOnly: true })

    res.json({
      code: 200,
      message: 'Discount code applied successfully!',
      voucherCode: voucher.code,
      discountAmount: discountAmount,
      subtotal: subtotal,
      totalPrice: totalPrice
    })

  } catch {
    res.status(500).json({ code: 500, message: 'A server error has occurred!' });
  }
}

// [ POST ]: /cart/remove-voucher
export const removeVoucher = async (req: Request, res: Response) => {
  res.clearCookie('voucher_code', {
    httpOnly: true,
    path: '/'
  })

  res.json({
    code: 200,
    message: 'Voucher removed successfully!'
  })
}