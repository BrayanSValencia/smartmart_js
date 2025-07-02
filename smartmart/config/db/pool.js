
import { Sequelize } from'sequelize';

import CategoryModel from './../../models/category.js'; 
import LoginModel from './../../models/login.js'; 
import OrderModel from './../../models/order.js';
import OrderItemModel from './../../models/orderitem.js';
import ProductModel from './../../models/product.js';
import ProductImageModel from './../../models/productimage.js';
import UserModel from './../../models/users.js';
import dotenv from 'dotenv';
import RefreshTokenModel from '../../models/refreshtoken.js';
import RolesModel from '../../models/roles.js';

dotenv.config(); // Load .env variables

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    pool: {
      max:  parseInt(process.env.POOLMAX),

      min: parseInt(process.env.POOLMIN),
      acquire:  parseInt(process.env.POOLACQUIRE),
      idle:  parseInt(process.env.POOLIDLE),
    },
    logging: false,
  }
);

const models = {
  User: UserModel.init(sequelize),
  Category:CategoryModel.init(sequelize),
  Login:LoginModel.init(sequelize),
  Order:OrderModel.init(sequelize),
  OrderItem:OrderItemModel.init(sequelize),
  Product:ProductModel.init(sequelize),
  ProductImage:ProductImageModel.init(sequelize),
  RefreshToken:RefreshTokenModel.init(sequelize),
  Roles:RolesModel.init(sequelize)
};

export { sequelize, models };
