import { Variable, Category, GroupVariable, GroupCategory } from '../models/index.model.js';
import { Op } from 'sequelize';

export const migrateJunctions = async () => {
    console.log("Migrating Variables to Junction Table...");
    const vars = await Variable.findAll({ where: { groupId: { [Op.ne]: null } } });
    for (const v of vars) {
         try {
            await GroupVariable.findOrCreate({ 
                where: { groupId: v.groupId, variableId: v.id },
                defaults: { groupId: v.groupId, variableId: v.id }
            });
         } catch(e) { console.error(e); }
    }
    
    console.log("Migrating Categories to Junction Table...");
    const cats = await Category.findAll({ where: { groupId: { [Op.ne]: null } } });
    for (const c of cats) {
        try {
            await GroupCategory.findOrCreate({ 
                where: { groupId: c.groupId, categoryId: c.id },
                defaults: { groupId: c.groupId, categoryId: c.id }
            });
        } catch(e) { console.error(e); }
    }
    console.log("Migration complete.");
};
