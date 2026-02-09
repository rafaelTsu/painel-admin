import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/sequelize.db.js';

export class AuditEvent extends Model {}

AuditEvent.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  actorUserId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  targetType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  targetId: {
    type: DataTypes.STRING, 
    allowNull: true,
  },
  groupId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  outcome: {
    type: DataTypes.ENUM('success', 'failure'),
    allowNull: false,
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
  }
}, {
  sequelize,
  modelName: 'AuditEvent',
  tableName: 'audit_events',
  timestamps: false, 
});

export default AuditEvent;
