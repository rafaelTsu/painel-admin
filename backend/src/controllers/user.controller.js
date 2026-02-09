import * as userService from '../services/user.service.js';
import { createUserSchema, updateUserSchema, userIdSchema } from '../validations/user.validator.js';

export const listUsers = async (req, res, next) => {
    try {
        const result = await userService.listUsers(req.query);
        res.json(result);
    } catch (err) {
        next(err);
    }
};

export const getUser = async (req, res, next) => {
    try {
        const { id } = await userIdSchema.validateAsync(req.params);
        const user = await userService.getUserById(id);
        res.json(user);
    } catch (err) {
        next(err);
    }
};

export const createUser = async (req, res, next) => {
    try {
        const value = await createUserSchema.validateAsync(req.body);
        const user = await userService.createUser(value);
        
        await req.audit({
            action: 'user.create',
            targetType: 'user',
            targetId: user.id,
            outcome: 'success',
            metadata: { email: user.email, role: user.role }
        });

        res.status(201).json(user);
    } catch (err) {
        next(err);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const { id } = await userIdSchema.validateAsync(req.params);
        const value = await updateUserSchema.validateAsync(req.body);
        
        const user = await userService.updateUser(id, value);

        await req.audit({
            action: 'user.update',
            targetType: 'user',
            targetId: user.id,
            outcome: 'success',
            metadata: { changes: Object.keys(value) }
        });

        res.json(user);
    } catch (err) {
        next(err);
    }
};

export const toggleActive = async (req, res, next) => {
    try {
        const { id } = await userIdSchema.validateAsync(req.params);
        // We can just use update, but specific endpoint is often cleaner for UI
        // Let's assume this is mostly for deactivation as per spec FR-007
        // But re-activation is also useful.
        // For strict FR-007 "deactivate", we call deactivate.
        // But let's check input or just assume request means toggle?
        // Usually PATCH /users/:id { isActive: false } is enough.
        // But if I want a dedicated route:
        
        const user = await userService.updateUser(id, { isActive: req.body.isActive });
        
        await req.audit({
            action: req.body.isActive ? 'user.activate' : 'user.deactivate',
            targetType: 'user',
            targetId: user.id,
            outcome: 'success'
        });
        
        res.json(user);
    } catch (err) {
        next(err);
    }
};
