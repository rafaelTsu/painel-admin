import Joi from 'joi';

export const createTemplateSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(null, '').optional()
});

export const createVersionSchema = Joi.object({
  changeNote: Joi.string().required()
});
