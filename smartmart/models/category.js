import { Model, DataTypes } from 'sequelize';

export default class Category extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'is_active',
        defaultValue: true
      },createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at',
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated_at',
        defaultValue: DataTypes.NOW
      }
    }, {
      sequelize,
      modelName: 'category',
      tableName: 'category',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['name']
        },
        {
          unique: true,
          fields: ['slug']
        }
      ]
    });
  }

  static associate(models) {
    this.hasMany(models.Product, {
      foreignKey: 'category_id',
      as: 'products'
    });
  }
}