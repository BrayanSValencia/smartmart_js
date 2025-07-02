import { Model, DataTypes } from 'sequelize';

export default class OrderItem extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      productId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'product_id'
      },
      quantity: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        validate: {
          min: 1
        }
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      }
      ,
      orderId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'order_id'
      }
    }, {
      sequelize,
      modelName: 'orderItem',
      tableName: 'orderitem',
      timestamps: false,
      underscored: true
    });
  }

  static associate(models) {
    this.belongsTo(models.Order, {
      foreignKey: 'order_id',
      as: 'order'
    });
  }
}