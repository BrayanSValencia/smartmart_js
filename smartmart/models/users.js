import { Model, DataTypes } from 'sequelize';

export default class User extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_login'
      },
      username: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'first_name'
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'last_name'
      },
      phone: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
          is: /^(3\d{2})[-.\s]?\d{3}[-.\s]?\d{4}$/
        }
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'date_of_birth'
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'is_active',
        defaultValue: true
      },
      roleId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'role_id',
        defaultValue: 1, // Default to regular user role
        validate: {
          isIn: [[1, 2]] // Valid role IDs: 1=user, 2=staff
        }
        
      }
    }, {
      sequelize,
      modelName: 'user',
      tableName: 'users',
      timestamps: true,
      underscored: true,
      defaultScope: {
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        }
      
      }
    });
  }

  static associate(models) {
    this.hasOne(models.Login, {
      foreignKey: 'user_id',
      as: 'login'
    });
    this.hasMany(models.Order, {
      foreignKey: 'user_id',
      as: 'orders'
    });
    
    // Removed the Role association
  }

  // Helper method to check roles
  hasRole(roleId) {
    return this.roleId === roleId;
  }
}