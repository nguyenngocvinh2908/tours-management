import { Request, Response } from 'express'
import CartItem from '../../models/cart-item'

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