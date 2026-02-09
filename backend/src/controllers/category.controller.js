import * as categoryService from '../services/category.service.js';
import { createCategorySchema, updateCategorySchema, assignVariablesSchema } from '../validations/category.validator.js';

export const createCategory = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const value = await createCategorySchema.validateAsync(req.body);
        const category = await categoryService.createCategory(groupId, value);
        await req.audit({ action: 'category.create', targetType: 'category', targetId: category.id, groupId: groupId, outcome: 'success' });
        res.status(201).json(category);
    } catch (err) { next(err); }
};

export const listCategories = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const { page, limit, search, includeVariables } = req.query;
        const result = await categoryService.listCategories(groupId, { 
            page, 
            limit, 
            search,
            includeVariables: includeVariables === 'true'
        });
        res.json(result);
    } catch (err) { next(err); }
};

export const updateCategory = async (req, res, next) => {
    try {
        const { groupId, id } = req.params;
        const value = await updateCategorySchema.validateAsync(req.body);
        const category = await categoryService.updateCategory(id, groupId, value);
        await req.audit({ action: 'category.update', targetType: 'category', targetId: category.id, groupId: groupId, outcome: 'success' });
        res.json(category);
    } catch (err) { next(err); }
};

export const getCategory = async (req, res, next) => {
    try {
        const { groupId, id } = req.params;
        const category = await categoryService.getCategory(id, groupId);
        res.json(category);
    } catch (err) { next(err); }
};

export const assignVariables = async (req, res, next) => {
    try {
        const { groupId, id } = req.params;
        const { variableIds } = await assignVariablesSchema.validateAsync(req.body);
        const category = await categoryService.assignVariablesToCategory(id, groupId, variableIds);
        await req.audit({ action: 'category.assignVariables', targetType: 'category', targetId: id, groupId: groupId, outcome: 'success' });
        res.json(category);
    } catch (err) { next(err); }
};
