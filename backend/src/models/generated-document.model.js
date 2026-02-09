
import { DataTypes } from 'sequelize';
import { sequelize } from '../db/sequelize.db.js';

const GeneratedDocument = sequelize.define('GeneratedDocument', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    simulationRunId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    format: {
        type: DataTypes.ENUM('docx', 'pdf'),
        allowNull: false
    },
    fileName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    filePath: {
        type: DataTypes.STRING,
        allowNull: false
    },
    byteSize: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    sha256: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'generated_documents',
    timestamps: true
});
export default GeneratedDocument;
