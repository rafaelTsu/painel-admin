import { AppError } from '../shared/errors.util.js';
import { env } from '../env.config.js';

export const errorMiddleware = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Joi validation error check
  if (err.isJoi) {
      error.statusCode = 400;
      error.message = err.details ? err.details.map(d => d.message).join(', ') : 'Validation Error';
      error.isOperational = true;
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
      error.statusCode = 400;
      error.message = 'Duplicate field value entered';
      error.isOperational = true;
  }
  
  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
      error.statusCode = 400;
      error.message = err.errors.map(e => e.message).join(', ');
      error.isOperational = true;
  }

  if (env.NODE_ENV === 'development') {
    console.error('ERROR 💥', err);
    return res.status(error.statusCode).json({
      status: 'error',
      statusCode: error.statusCode,
      message: error.message,
      stack: err.stack,
      error: err
    });
  }

  // Production
  if (err.isOperational || error.isOperational) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    });
  }

  // Programming or other unknown error
  console.error('ERROR 💥', err); 
  return res.status(500).json({
    status: 'error',
    message: 'Something went very wrong!',
  });
};
