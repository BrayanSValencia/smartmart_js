import { Model, DataTypes } from 'sequelize';

export default class Login extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      email: {
        type: DataTypes.STRING(254),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: DataTypes.STRING(128),
        allowNull: false
      },
        userId: {
      type: DataTypes.BIGINT,
      allowNull: false, 
      field: 'user_id',
      references: {
        model: 'user', 
        key: 'id'
      }
    }
    }, {
      sequelize,
      modelName: 'login',
      tableName: 'login',
      timestamps: false,
      underscored: true
    });
  }

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  }

  static hooks() {
    this.beforeSave(async (login) => {
      if (login.changed('password')) {
        login.password = await hashPassword(login.password);
      }
    });
  }
}