import { Category, GroupCategory, GroupVariable, Variable } from '../models/index.model.js';
import { ConflictError, NotFoundError } from '../shared/errors.util.js';
import { paginate } from '../shared/pagination.util.js';
import { Op } from 'sequelize';

export const createCategory = async (groupId, data) => {
    const existing = await Category.findOne({ where: { name: data.name } });
    if (existing) {
        throw new ConflictError(`Category '${data.name}' already exists in the system`);
    }

    const category = await Category.create({
        ...data,
        groupId: null
    });
    
    if (groupId) {
        await GroupCategory.create({ groupId, categoryId: category.id });
    }
    return category;
};

export const listCategories = async (groupId, { page = 1, limit = 50, search, includeVariables = false }) => {
    const associations = await GroupCategory.findAll({ 
        where: { groupId }, 
        attributes: ['categoryId'] 
    });
    const ids = associations.map(a => a.categoryId);

    const where = {
        id: { [Op.in]: ids }
    };
    
    if (search) {
        where.name = { [Op.iLike]: `%${search}%` };
    }

    const options = {
        where,
        order: [['name', 'ASC']]
    };

    if (includeVariables) {
        const groupVarAssociations = await GroupVariable.findAll({ where: { groupId }, attributes: ['variableId'] });
        const groupVarIds = groupVarAssociations.map(v => v.variableId);

        options.include = [{
            model: Variable,
            as: 'variables',
            where: { id: { [Op.in]: groupVarIds } },
            required: false,
            through: { attributes: [] }
        }];
    }

    return paginate(Category, { page, limit }, options);
};

export const updateCategory = async (id, groupId, data) => {
    const association = await GroupCategory.findOne({ where: { groupId, categoryId: id } });
    if (!association) throw new NotFoundError('Category not associated with this group');

    const category = await Category.findByPk(id);
    if (!category) throw new NotFoundError('Category not found');

    return category.update(data);
};

export const getCategory = async (id, groupId) => {
    const association = await GroupCategory.findOne({ where: { groupId, categoryId: id } });
    if (!association) throw new NotFoundError('Category not found in this group');
    
    return Category.findByPk(id);
};

export const associateCategory = async (groupId, categoryId) => {
    return GroupCategory.findOrCreate({ where: { groupId, categoryId } });
};

export const dissociateCategory = async (groupId, categoryId) => {
    return GroupCategory.destroy({ where: { groupId, categoryId } });
};

export const assignVariablesToCategory = async (categoryId, groupId, variableIds) => {
    // Verify category is linked to group
    const association = await GroupCategory.findOne({ where: { groupId, categoryId } });
    if (!association) throw new NotFoundError('Category not found in this group');

    const category = await Category.findByPk(categoryId);
    if (!category) throw new NotFoundError('Category not found');

    // "setVariables" handles removing unlisted and adding new ones
    await category.setVariables(variableIds);
    return category;
};

export const listAllCategories = async ({ page=1, limit=50, search }) => {
     const where = {};
    if (search) {
        where.name = { [Op.iLike]: `%${search}%` };
    }
    return paginate(Category, { page, limit }, { where, order: [['name', 'ASC']] });
};
