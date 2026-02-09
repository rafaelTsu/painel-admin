import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/sequelize.db.js';

export class Category extends Model {}

Category.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  groupId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  sequelize,
  modelName: 'Category',
  tableName: 'categories',
  indexes: [
    { unique: true, fields: ['groupId', 'name'] }
  ]
});

export default Category;
