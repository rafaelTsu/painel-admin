import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/sequelize.db.js';

export class Template extends Model {}

Template.init({
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
  },
  revision: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  createdByUserId: {
    type: DataTypes.UUID,
    allowNull: true,
  }
}, {
  sequelize,
  modelName: 'Template',
  tableName: 'templates',
  indexes: [
    { unique: true, fields: ['groupId', 'name'] }
  ]
});

export default Template;
