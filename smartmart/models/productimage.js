import { Model, DataTypes } from 'sequelize';

export default class ProductImage extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      imageUrl: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'image_url',
        validate: {
          isUrl: true
        }
      }
    }, {
      sequelize,
      modelName: 'productImage',
      tableName: 'productimage',
      timestamps: false,
      underscored: true
    });
  }

  static associate(models) {
    this.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product'
    });
  }
}