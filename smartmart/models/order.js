import { Model, DataTypes } from 'sequelize';

export default class Order extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      invoiceId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: 'invoice_id'
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      subTotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'sub_total'
      },
      tax: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      taxIco: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'tax_ico'
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      isPaid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'is_paid',
        defaultValue: false
      },
        userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'user_id',
       
        }
        
      

    }, {
      sequelize,
      modelName: 'order',
      tableName: 'order',
      timestamps: true,
      underscored: true
    });
  }

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    this.hasMany(models.OrderItem, {
      foreignKey: 'order_id',
      as: 'items'
    });
  }
}