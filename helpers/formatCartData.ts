import { getFirstImage } from "./handleImageTour"

export const formatCartData = (cartItems: any[]) => {
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
  return {
    items,
    totalPrice,
    totalQuantity
  }
}