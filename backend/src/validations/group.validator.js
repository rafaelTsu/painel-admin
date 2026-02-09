import Joi from 'joi';

export const createGroupSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().allow('', null).max(500),
  isActive: Joi.boolean().default(true)
});

export const updateGroupSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  description: Joi.string().allow('', null).max(500),
  isActive: Joi.boolean()
}).min(1);

export const groupIdSchema = Joi.object({
    id: Joi.string().uuid().required()
});

export const memberSchema = Joi.object({
    userId: Joi.string().uuid().required()
});
