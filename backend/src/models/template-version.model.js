import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/sequelize.db.js';

export class TemplateVersion extends Model {}

TemplateVersion.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  templateId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  versionNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  changeNote: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdByUserId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  docxPath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  logicDefinition: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  referencedVariableKeys: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  }
}, {
  sequelize,
  modelName: 'TemplateVersion',
  tableName: 'template_versions',
  indexes: [
    { unique: true, fields: ['templateId', 'versionNumber'] }
  ]
});

export default TemplateVersion;
