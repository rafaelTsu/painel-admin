import Joi from 'joi';

export const createCategorySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(null, '').optional()
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().allow(null, '').optional()
});

export const assignVariablesSchema = Joi.object({
  variableIds: Joi.array().items(Joi.string().uuid()).required()
});
