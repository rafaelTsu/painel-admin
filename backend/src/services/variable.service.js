import { Variable, GroupVariable, Group } from '../models/index.model.js';
import { ConflictError, NotFoundError } from '../shared/errors.util.js';
import { paginate } from '../shared/pagination.util.js';
import { Op } from 'sequelize';

export const createVariable = async (groupId, data) => {
    const existing = await Variable.findOne({ where: { key: data.key } });
    if (existing) {
        throw new ConflictError(`Variable key '${data.key}' already exists in the system`);
    }

    const variable = await Variable.create({
        ...data,
        groupId: null
    });
    
    if (groupId) {
        await GroupVariable.create({ groupId, variableId: variable.id });
    }
    
    return variable;
};

export const listVariables = async (groupId, { page = 1, limit = 50, search }) => {
    const associations = await GroupVariable.findAll({ 
        where: { groupId }, 
        attributes: ['variableId'] 
    });
    const associatedIds = associations.map(a => a.variableId);

    const where = {
        id: { [Op.in]: associatedIds }
    };
    
    if (search) {
        where[Op.and] = [
             {
                 [Op.or]: [
                    { key: { [Op.iLike]: `%${search}%` } },
                    { label: { [Op.iLike]: `%${search}%` } }
                ]
             }
        ];
    }

    return paginate(Variable, { page, limit }, { 
        where, 
        order: [['key', 'ASC']]
    });
};

export const updateVariable = async (id, groupId, data) => {
    const association = await GroupVariable.findOne({ where: { groupId, variableId: id } });
    if (!association) throw new NotFoundError('Variable not associated with this group');

    const variable = await Variable.findByPk(id);
    if (!variable) throw new NotFoundError('Variable not found');

    return variable.update(data);
};

export const getVariable = async (id, groupId) => {
    const association = await GroupVariable.findOne({ where: { groupId, variableId: id } });
    if (!association) throw new NotFoundError('Variable not found in this group');
    
    const variable = await Variable.findByPk(id);
    return variable;
};

export const associateVariable = async (groupId, variableId) => {
    return GroupVariable.findOrCreate({ where: { groupId, variableId } });
};

export const dissociateVariable = async (groupId, variableId) => {
    return GroupVariable.destroy({ where: { groupId, variableId } });
};

export const listAllVariables = async ({ page=1, limit=50, search }) => {
    const where = {};
    if (search) {
         where[Op.or] = [
            { key: { [Op.iLike]: `%${search}%` } },
            { label: { [Op.iLike]: `%${search}%` } }
        ];
    }
    return paginate(Variable, { page, limit }, { 
        where, 
        order: [['key', 'ASC']],
        include: [{
            model: Group,
            as: 'groups',
            attributes: ['id', 'name'],
            through: { attributes: [] }
        }]
    });
};
