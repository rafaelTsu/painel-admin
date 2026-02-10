import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/sequelize.db.js';

export class Variable extends Model {}

Variable.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  groupId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('boolean', 'text'),
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  sequelize,
  modelName: 'Variable',
  tableName: 'variables',
  indexes: [
    { unique: true, fields: ['groupId', 'key'] }
  ]
});

export default Variable;
