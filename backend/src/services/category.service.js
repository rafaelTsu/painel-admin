import { Category, Variable, CategoryVariable } from '../models/index.model.js';
import { ConflictError, NotFoundError } from '../shared/errors.util.js';
import { paginate } from '../shared/pagination.util.js';
import { Op } from 'sequelize';
import { sequelize } from '../db/sequelize.db.js';

export const createCategory = async (groupId, data) => {
    const existing = await Category.findOne({ where: { groupId, name: data.name } });
    if (existing) throw new ConflictError(`Category '${data.name}' already exists in this group`);

    return Category.create({
        ...data,
        groupId
    });
};

export const listCategories = async (groupId, { page = 1, limit = 50, search, includeVariables = false }) => {
    const where = { groupId };
    
    if (search) {
        where.name = { [Op.iLike]: `%${search}%` };
    }

    const options = {
        where,
        order: [['name', 'ASC']]
    };

    if (includeVariables) {
        options.include = [{
            model: Variable,
            as: 'variables',
            through: { attributes: [] } // hide join table
        }];
    }

    return paginate(Category, { page, limit }, options);
};

export const updateCategory = async (id, groupId, data) => {
    const category = await Category.findOne({ where: { id, groupId } });
    if (!category) throw new NotFoundError('Category not found');

    // If name changed, check uniqueness
    if (data.name && data.name !== category.name) {
         const existing = await Category.findOne({ where: { groupId, name: data.name } });
         if (existing) throw new ConflictError(`Category '${data.name}' already exists in this group`);
    }

    return category.update(data);
};

export const getCategory = async (id, groupId) => {
    const category = await Category.findOne({ 
        where: { id, groupId },
        include: [{ model: Variable, as: 'variables', through: { attributes: [] } }]
    });
    if (!category) throw new NotFoundError('Category not found');
    return category;
};

export const assignVariablesToCategory = async (id, groupId, variableIds) => {
    const category = await Category.findOne({ where: { id, groupId } });
    if (!category) throw new NotFoundError('Category not found');

    // Verify all variables belong to the group
    const variables = await Variable.findAll({
        where: {
            id: { [Op.in]: variableIds },
            groupId
        }
    });

    if (variables.length !== variableIds.length) {
        throw new NotFoundError('One or more variables not found in this group');
    }

    // Replace assignments using transaction
    await sequelize.transaction(async (t) => {
        // We can just use setVariables if using magic methods, assuming mixins are initialized
        // Category.belongsToMany(Variable)
        // category.setVariables(variableIds, { transaction: t })
        await category.setVariables(variableIds, { transaction: t });
    });
    
    return getCategory(id, groupId);
};
