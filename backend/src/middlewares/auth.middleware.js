import jwt from 'jsonwebtoken';
import { env } from '../env.config.js';
import { UnauthorizedError } from '../shared/errors.util.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }
    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
        req.user = decoded; 
    } catch (err) {
        throw new UnauthorizedError('Invalid token');
    }
    
    next();
  } catch (err) {
    next(err);
  }
};
