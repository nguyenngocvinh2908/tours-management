import { DataTypes } from 'sequelize'
import sequelize from '../config/database'

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  accountId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'account_id'
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
  tableName: 'carts',
  timestamps: true
})

export default Cart