import { DataTypes } from 'sequelize'
import sequelize from '../config/database'
import Cart from './cart'
import Tour from './tour'

const CartItem = sequelize.define('CartItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  cartId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'cart_id'
  },
  tourId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'tour_id'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'cart_items',
  timestamps: true
})

// Thiết lập mối quan hệ để sử dụng truy vấn sequelize
Cart.hasMany(CartItem, { foreignKey: 'cart_id' })
CartItem.belongsTo(Cart, { foreignKey: 'cart_id' })

Tour.hasMany(CartItem, { foreignKey: 'tour_id' })
CartItem.belongsTo(Tour, { foreignKey: 'tour_id' })

export default CartItem