import { Variable } from '../models/index.model.js';
import { ConflictError, NotFoundError } from '../shared/errors.util.js';
import { paginate } from '../shared/pagination.util.js';
import { Op } from 'sequelize';

export const createVariable = async (groupId, data) => {
    // Check uniqueness
    const existing = await Variable.findOne({ where: { groupId, key: data.key } });
    if (existing) throw new ConflictError(`Variable key '${data.key}' already exists in this group`);

    return Variable.create({
        ...data,
        groupId
    });
};

export const listVariables = async (groupId, { page = 1, limit = 50, search }) => {
    const where = { groupId };
    
    if (search) {
        where[Op.or] = [
            { key: { [Op.iLike]: `%${search}%` } },
            { label: { [Op.iLike]: `%${search}%` } }
        ];
    }

    return paginate(Variable, { page, limit }, { 
        where, 
        order: [['key', 'ASC']]
    });
};

export const updateVariable = async (id, groupId, data) => {
    const variable = await Variable.findOne({ where: { id, groupId } });
    if (!variable) throw new NotFoundError('Variable not found');

    return variable.update(data);
};

export const getVariable = async (id, groupId) => {
    const variable = await Variable.findOne({ where: { id, groupId } });
    if (!variable) throw new NotFoundError('Variable not found');
    return variable;
};
