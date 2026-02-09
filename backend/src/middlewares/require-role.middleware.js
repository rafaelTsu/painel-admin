import { ForbiddenError } from '../shared/errors.util.js';

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError('Access denied'));
    }
    next();
  };
};
