import { DataTypes } from 'sequelize'
import sequelize from '../config/database'

const Voucher = sequelize.define('Voucher', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  discountType: {
    type: DataTypes.ENUM('percent', 'fixed'),
    allowNull: false,
    defaultValue: 'fixed',
  },
  discountValue: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  maxDiscount: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  minOrderValue: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1, // 1: Active, 0: Inactive
  }
}, {
  tableName: 'vouchers',
  timestamps: true,
});

export default Voucher