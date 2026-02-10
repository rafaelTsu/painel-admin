import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/sequelize.db.js';

export class GroupCategory extends Model {}

GroupCategory.init({
  groupId: {
    type: DataTypes.UUID,
    primaryKey: true
  },
  categoryId: {
    type: DataTypes.UUID,
    primaryKey: true
  }
}, {
  sequelize,
  modelName: 'GroupCategory',
  tableName: 'group_categories',
  timestamps: false
});

export default GroupCategory;
