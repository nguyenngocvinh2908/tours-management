import { Request, Response } from 'express'
import CartItem from '../../models/cart-item'

// [ POST ]: /cart/add
export const addToCart = async (req: Request, res: Response) => {
  try {
    console.log(req.body)
    const cartId = req.cookies.cart_id
    const tourId = parseInt(req.body.tourId)
    const quantity = parseInt(req.body.quantity)

    // 1. Check Tour Exits
    const exitsItem: any = await CartItem.findOne({
      where: { 
        cartId: cartId, 
        tourId: tourId,
        deleted: false
      } 
    })
    
    if(exitsItem) {
      // 2. Update Quantity
      const newQuantity = exitsItem.get('quantity') as number + quantity 
      await exitsItem.update({ quantity: newQuantity })
    } else {
      // 3. Create New Cart_Item
      await CartItem.create({
        cartId: cartId,
        tourId: tourId,
        quantity: quantity
      })
    }

    res.redirect(req.get('Referrer') || '/tours')
  } catch (error) {
    console.error('Error adding to cart:', error)
    res.redirect('/tours')
  }
}