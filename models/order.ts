import { DataTypes } from 'sequelize'
import sequelize from '../config/database'
import OrderItem from './order-item'

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  fullName: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    defaultValue: 'cash',
  },
  paymentStatus: {
    type: DataTypes.STRING(20),
    defaultValue: 'unpaid',
  },
  voucherCode: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  discountAmount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalPrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  note: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'orders',
  timestamps: true, // Tự động map createdAt và updatedAt
})

// Quan Hệ 1 - N: Mot Order có nhiều OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items'})

export default Order