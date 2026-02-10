import Joi from 'joi';

export const createVariableSchema = Joi.object({
  key: Joi.string().required(),
  label: Joi.string().required(),
  type: Joi.string().valid('boolean', 'text').required(),
  description: Joi.string().allow(null, '').optional(),
  isActive: Joi.boolean().optional(),
  groupId: Joi.string().uuid().allow(null).optional() // to allow creating global variables
});

export const updateVariableSchema = Joi.object({
  label: Joi.string().optional(),
  description: Joi.string().allow(null, '').optional(),
  isActive: Joi.boolean().optional()
});
