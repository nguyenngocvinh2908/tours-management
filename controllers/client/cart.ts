import { Request, Response } from 'express'
import CartItem from '../../models/cart-item'
import Tour from '../../models/tour'
import { getFirstImage } from '../../helpers/handleImageTour' 


// [ GET ]: /cart
export const index = async (req: Request, res: Response) => {
  try {
    const cartId = req.cookies.cart_id
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

    let totalQuantity = 0
    let totalPrice = 0
    
    // Xử Lý Tính Toán Giá Trị Thực Tế Và Tổng Tiền
    const items = cartItems.map((item: any) => {
      const itemPlain = item.get({ plain: true })
      // Sequelize mặc định sẽ gán vào `Tour` (viết hoa) hoặc `tour` (viết thường)
      const tour = itemPlain.Tour || itemPlain.tour
      if(!tour) return null 
      
      // Get One Image In Images
      tour.images = [getFirstImage(tour.images)]
      // Get Price Alter Discount Tour
      const priceSpecial = tour.discount ? Math.round(tour.price * (1 - tour.discount / 100)) : tour.price
      const itemTotalPrice = priceSpecial * item.quantity

      totalQuantity += item.quantity
      totalPrice += itemTotalPrice

      return {
        id: item.id,
        quantity: item.quantity,
        priceSpecial: priceSpecial,
        totalPrice: itemTotalPrice,
        tour: tour
      }
    }).filter(Boolean) // Loại Bỏ Null Khi Map

    res.render('client/pages/carts/index.pug', {
      titlePage: 'My Cart',
      cart: {
        items: items,
        totalQuantity: totalQuantity,
        totalPrice: totalPrice
      }
    })
  } catch(e) {
    console.log(e)
    req.flash('error', 'Error loading cart data!')
    res.redirect('/')
  }
}

// [ POST ]: /cart/add
export const addToCart = async (req: Request, res: Response) => {
  const backUrl = String(req.get('Referrer'))

  try {
    const cartId = req.cookies.cart_id
    const tourId = parseInt(req.body.tourId)
    const quantity = parseInt(req.body.quantity) || 1

    const exitsItem: any = await CartItem.findOne({
      where: { 
        cartId: cartId, 
        tourId: tourId,
        deleted: false
      } 
    })
    
    if (exitsItem) {
      const newQuantity = (exitsItem.get('quantity') as number) + quantity 
      await exitsItem.update({ quantity: newQuantity })
    } else {
      await CartItem.create({
        cartId: cartId,
        tourId: tourId,
        quantity: quantity
      })
    }

    req.flash('success', 'Tour added to cart successfully!')
    res.redirect(backUrl)
    
  } catch (error) {
    req.flash('error', 'Failed to add tour to cart.')
    res.redirect(backUrl)
  }
}