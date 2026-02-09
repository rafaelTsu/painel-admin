
import { DataTypes } from 'sequelize';
import { sequelize } from '../db/sequelize.db.js';

const SimulationRun = sequelize.define('SimulationRun', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    groupId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    templateId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    templateVersionId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    requestedByUserId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('queued', 'running', 'succeeded', 'failed'),
        allowNull: false,
        defaultValue: 'queued'
    },
    outputFormat: {
        type: DataTypes.ENUM('docx', 'pdf'),
        allowNull: false
    },
    inputValues: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
    },
    errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    startedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    finishedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'simulation_runs',
    timestamps: true
});
export default SimulationRun;
