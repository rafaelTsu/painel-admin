import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/sequelize.db.js';

export class GroupVariable extends Model {}

GroupVariable.init({
  groupId: {
    type: DataTypes.UUID,
    primaryKey: true
  },
  variableId: {
    type: DataTypes.UUID,
    primaryKey: true
  }
}, {
  sequelize,
  modelName: 'GroupVariable',
  tableName: 'group_variables',
  timestamps: false
});

export default GroupVariable;
