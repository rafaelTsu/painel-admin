import * as groupService from '../services/group.service.js';
import { createGroupSchema, updateGroupSchema, groupIdSchema, memberSchema } from '../validations/group.validator.js';
import Joi from 'joi';

export const listGroups = async (req, res, next) => {
    try {
        // User from auth middleware
        const result = await groupService.listGroups(req.user, req.query);
        res.json(result);
    } catch (err) {
        next(err);
    }
};

export const getGroup = async (req, res, next) => {
    try {
        const { id } = await groupIdSchema.validateAsync(req.params);
        const group = await groupService.getGroupById(id, req.user);
        res.json(group);
    } catch (err) {
        next(err);
    }
};

export const createGroup = async (req, res, next) => {
    try {
        const value = await createGroupSchema.validateAsync(req.body);
        const group = await groupService.createGroup(value);
        
        await req.audit({
            action: 'group.create',
            targetType: 'group',
            targetId: group.id,
            outcome: 'success',
            metadata: { name: group.name }
        });

        res.status(201).json(group);
    } catch (err) {
        next(err);
    }
};

export const updateGroup = async (req, res, next) => {
    try {
        const { id } = await groupIdSchema.validateAsync(req.params);
        const value = await updateGroupSchema.validateAsync(req.body);
        
        const group = await groupService.updateGroup(id, value);

        await req.audit({
            action: 'group.update',
            targetType: 'group',
            targetId: group.id,
            outcome: 'success',
            metadata: { changes: Object.keys(value) }
        });

        res.json(group);
    } catch (err) {
        next(err);
    }
};

export const deleteGroup = async (req, res, next) => {
    try {
        const { id } = await groupIdSchema.validateAsync(req.params);
        await groupService.deleteGroup(id);
        
        await req.audit({
            action: 'group.delete',
            targetType: 'group',
            targetId: id,
            outcome: 'success'
        });

        res.status(204).send();
    } catch (err) {
        next(err);
    }
};

export const addMember = async (req, res, next) => {
    try {
        const { id: groupId } = await groupIdSchema.validateAsync(req.params);
        const { userId } = await memberSchema.validateAsync(req.body);
        
        await groupService.addMember(groupId, userId, req.user.id);
        
        await req.audit({
            action: 'group.member.add',
            targetType: 'group',
            targetId: groupId,
            outcome: 'success',
            metadata: { userId }
        });

        res.status(201).json({ message: 'Member added' });
    } catch (err) {
        next(err);
    }
};

export const removeMember = async (req, res, next) => {
    try {
        const { id: groupId, userId } = await groupIdSchema.validateAsync({ id: req.params.id }) 
                                        // userId is also param usually: /groups/:id/members/:userId
        // But let's check validation args.
        // If route is /:id/members/:userId
        
        // Let's validate composite params?
        // Reuse Joi manually
        const params = await Joi.object({
            id: Joi.string().uuid().required(),
            userId: Joi.string().uuid().required()
        }).validateAsync(req.params);

        await groupService.removeMember(params.id, params.userId);

        await req.audit({
            action: 'group.member.remove',
            targetType: 'group',
            targetId: params.id,
            outcome: 'success',
            metadata: { userId: params.userId }
        });

        res.status(204).send();
    } catch (err) {
        next(err);
    }
};

export const listMembers = async (req, res, next) => {
    try {
        const { id } = await groupIdSchema.validateAsync(req.params);
        // Ensure user can see this group
        await groupService.getGroupById(id, req.user); // Checks visibility
        
        const members = await groupService.listMembers(id);
        res.json(members);
    } catch (err) {
        next(err);
    }
};
