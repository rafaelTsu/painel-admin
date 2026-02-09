import * as variableService from '../services/variable.service.js';
import { createVariableSchema, updateVariableSchema } from '../validations/variable.validator.js';

export const createVariable = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const value = await createVariableSchema.validateAsync(req.body);
        const variable = await variableService.createVariable(groupId, value);
        await req.audit({ action: 'variable.create', targetType: 'variable', targetId: variable.id, groupId: groupId, outcome: 'success' });
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
