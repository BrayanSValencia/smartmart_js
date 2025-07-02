import { Model, DataTypes } from 'sequelize';

export default class Product extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      stockQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'stock_quantity',
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'is_active',
        defaultValue: true
      },
      categoryId: {
      type: DataTypes.BIGINT,
      allowNull: false, 
      field: 'category_id',
      references: {
        model: 'category', 
        key: 'id'
      }
    }
  },
   {
      sequelize,
      modelName: 'product',
      tableName: 'product',
      timestamps: true,
      underscored: true
    });
  }

  static associate(models) {
    this.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category'
    });
    this.hasMany(models.ProductImage, {
      foreignKey: 'product_id',
      as: 'images'
    });
  }
}