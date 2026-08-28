import { Sequelize } from "sequelize"
import dotenv from 'dotenv'
dotenv.config()

const sequelize = new Sequelize(
  process.env.DATABASE_NAME!,
  process.env.USER_NAME!,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST,
    port: 3307,
    dialect: 'mysql'
  }
) 

sequelize.authenticate().then(() => {
  console.log('Connect Sucess')
}).catch((error) => {
  console.log('Connect Error', error)
})

export default sequelize