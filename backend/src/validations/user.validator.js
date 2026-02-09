import Joi from 'joi';

const roleEnum = ['administrator', 'attorney', 'evaluator'];

export const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid(...roleEnum).required(),
  isActive: Joi.boolean().default(true)
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  email: Joi.string().email(), // Should we allow email update? Spec doesn't forbid.
  // password update usually separate, but admin can reset? 
  // Let's allow password update if provided, but optional
  password: Joi.string().min(8), 
  role: Joi.string().valid(...roleEnum),
  isActive: Joi.boolean()
}).min(1);

export const userIdSchema = Joi.object({
    id: Joi.string().uuid().required()
});
