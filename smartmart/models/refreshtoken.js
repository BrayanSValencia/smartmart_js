import { Model, DataTypes } from 'sequelize';

export default class RefreshToken extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'user_id'
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      jti: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true
      },
      revoked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      issuedAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        defaultValue:new Date(Date.now())
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
        defaultValue:new Date(Date.now())

      }
    }, {
      sequelize,
      modelName: 'RefreshToken',
      tableName: 'refresh_tokens',
      timestamps: true,
      underscored: true
    });
  }

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  }
}
