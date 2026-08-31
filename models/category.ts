import { DataTypes } from "sequelize"
import sequelize from "../config/database"

const Category = sequelize.define("Category", 
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255)
    },
    image: {
      type: DataTypes.STRING(500)
    },
    description: {
      type: DataTypes.TEXT('long')
    },
    status: {
      type: DataTypes.STRING(20)
    },
    position: {
      type: DataTypes.INTEGER
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deletedAt: {
      type: DataTypes.DATE
    },
  }, 
  {
    tableName: "categories",
    timestamps: true // Auto Mangement CreatedAt And UpdatedAt
  }
)

export default Category