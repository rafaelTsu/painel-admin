import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/sequelize.db.js';

export class CategoryVariable extends Model {}

CategoryVariable.init({
  categoryId: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true, // Composite PK or just fields in through table? Sequelize through tables usually don't need explicit ID unless defined. But standard join table.
    // If I define PK here, it overrides default.
    // Let's rely on standard FKs.
  },
  variableId: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
  }
}, {
  sequelize,
  modelName: 'CategoryVariable',
  tableName: 'category_variables',
  indexes: []
});

export default CategoryVariable;
