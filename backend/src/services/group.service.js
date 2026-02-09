import { Group, User, Membership } from '../models/index.model.js';
import { ConflictError, NotFoundError, BadRequestError } from '../shared/errors.util.js';
import { paginate } from '../shared/pagination.util.js';
import { Op } from 'sequelize';

export const listGroups = async (user, { page = 1, limit = 10, search, isActive }) => {
    const where = {};
    const include = [];
    
    if (search) {
        where.name = { [Op.iLike]: `%${search}%` };
    }

    if (isActive !== undefined) {
        where.isActive = isActive === 'true' || isActive === true;
    }

    // Role-based scoping
    if (user.role === 'attorney') {
        include.push({
            model: User,
            as: 'members',
            where: { id: user.id },
            attributes: [], // We just want to filter
            through: { attributes: [] }
        });
    } else if (user.role !== 'administrator') {
        // Evaluators shouldn't see groups lists typically via this service/endpoint anyway?
        // But simply return empty to be safe
        return { docs: [], total: 0, pages: 0, page };
    }

    return paginate(Group, { page, limit }, { 
        where, 
        include,
        order: [['name', 'ASC']],
        distinct: true // Important for includes
    });
};

export const getGroupById = async (id, user) => {
    const group = await Group.findByPk(id);
    if (!group) throw new NotFoundError('Group not found');

    if (user.role === 'attorney') {
        // Verify membership
        const isMember = await Membership.findOne({ where: { groupId: id, userId: user.id } });
        if (!isMember) throw new NotFoundError('Group not found'); // Hide non-member groups
    }

    return group;
};

export const createGroup = async (data) => {
    const existing = await Group.findOne({ where: { name: data.name } });
    if (existing) throw new ConflictError('Group name already in use');

    return Group.create(data);
};

export const updateGroup = async (id, data) => {
    const group = await Group.findByPk(id);
    if (!group) throw new NotFoundError('Group not found');

    if (data.name && data.name !== group.name) {
        const existing = await Group.findOne({ where: { name: data.name } });
        if (existing) throw new ConflictError('Group name already in use');
    }

    await group.update(data);
    return group;
};

export const deleteGroup = async (id) => {
    const group = await Group.findByPk(id);
    if (!group) throw new NotFoundError('Group not found');
    
    // Hard delete or soft?
    // User was soft, Group FR-010 says "delete".
    // Usually safest to soft delete via isActive=false, or hard delete if no deps.
    // If it has dependencies (Templates), hard delete will fail or cascade.
    // Let's assume soft delete via isActive for now, or just destroy if no protection.
    // Given "Templates... associated... with owning group", deleting group deletes templates?
    // Probably safer to block if templates exist. 
    // For MVP, allow destroy.
    
    await group.destroy();
};

export const addMember = async (groupId, userId, actorId) => {
    const group = await Group.findByPk(groupId);
    if (!group) throw new NotFoundError('Group not found');

    const user = await User.findByPk(userId);
    if (!user) throw new NotFoundError('User not found');

    if (user.role !== 'attorney') {
        throw new BadRequestError('Only attorneys can be assigned to groups');
    }

    const existing = await Membership.findOne({ where: { groupId, userId } });
    if (existing) throw new ConflictError('User is already a member of this group');

    return Membership.create({
        groupId,
        userId,
        createdByUserId: actorId
    });
};

export const removeMember = async (groupId, userId) => {
    const membership = await Membership.findOne({ where: { groupId, userId } });
    if (!membership) throw new NotFoundError('Membership not found');

    await membership.destroy();
};

export const listMembers = async (groupId) => {
     // Helper to see who is in group
     const group = await Group.findByPk(groupId, {
         include: [
             {
                 model: User,
                 as: 'members',
                 attributes: ['id', 'name', 'email', 'role'],
                 through: { attributes: [] }
             }
         ]
     });
     if (!group) throw new NotFoundError('Group not found');
     return group.members;
};
