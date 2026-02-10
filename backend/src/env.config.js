import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(4000),
  DATABASE_URL: Joi.string().required(),
  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  FILES_BASE_PATH: Joi.string().required(),
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
}).unknown();

const { error, value } = schema.validate(process.env, { abortEarly: false });

if (error) {
  console.error('Environment validation error:', error.details.map((d) => d.message).join(', '));
  process.exit(1);
}

export const env = value;
