import { cartId } from './../../middlewares/client/cart';
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
