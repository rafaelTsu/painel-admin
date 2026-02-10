import * as variableService from '../services/variable.service.js';
import { createVariableSchema, updateVariableSchema } from '../validations/variable.validator.js';

export const createVariable = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const value = await createVariableSchema.validateAsync(req.body);
        
        // If body explicitly sets groupId to null, treat as global variable
        // Otherwise default to URL parameter
        const targetGroupId = (value.groupId === null) ? null : groupId;

        const variable = await variableService.createVariable(targetGroupId, value);
        await req.audit({ action: 'variable.create', targetType: 'variable', targetId: variable.id, groupId: targetGroupId, outcome: 'success' });
        res.status(201).json(variable);
    } catch (err) { next(err); }
};

export const listVariables = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const { page, limit, search } = req.query;
        const result = await variableService.listVariables(groupId, { page, limit, search });
        res.json(result);
    } catch (err) { next(err); }
};

export const updateVariable = async (req, res, next) => {
    try {
        const { groupId, id } = req.params;
        const value = await updateVariableSchema.validateAsync(req.body);
        const variable = await variableService.updateVariable(id, groupId, value);
        await req.audit({ action: 'variable.update', targetType: 'variable', targetId: variable.id, groupId: groupId, outcome: 'success' });
        res.json(variable);
    } catch (err) { next(err); }
};

export const getVariable = async (req, res, next) => {
    try {
        const { groupId, id } = req.params;
        const variable = await variableService.getVariable(id, groupId);
        res.json(variable);
    } catch (err) { next(err); }
};

export const listAll = async (req, res, next) => {
    try {
        const { page, limit, search } = req.query;
        const result = await variableService.listAllVariables({ page, limit, search });
        res.json(result);
    } catch (err) { next(err); }
};

export const associateVariable = async (req, res, next) => {
    try {
        const { id } = req.params; // Variable ID
        const { groupId } = req.body;
        
        await variableService.associateVariable(groupId, id);
        
        await req.audit({ action: 'variable.associate', targetType: 'variable', targetId: id, groupId, outcome: 'success' });
        res.status(200).json({ success: true });
    } catch(err) { next(err); }
};

export const dissociateVariable = async (req, res, next) => {
    try {
        const { id, groupId } = req.params; // /variables/:id/groups/:groupId
        
        await variableService.dissociateVariable(groupId, id);
        
        await req.audit({ action: 'variable.dissociate', targetType: 'variable', targetId: id, groupId, outcome: 'success' });
        res.status(200).json({ success: true });
    } catch(err) { next(err); }
};
