import { ForbiddenError } from '../shared/errors.util.js';
import { Membership } from '../models/index.model.js';

export const requireGroupMembership = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const user = req.user;

        if (user.role === 'administrator') {
            return next();
        }

        if (user.role === 'attorney') {
            const membership = await Membership.findOne({ where: { userId: user.id, groupId } });
            if (!membership) {
                return next(new ForbiddenError('Not a member of this group'));
            }
            return next(); 
        }
        
        return next(new ForbiddenError('Access denied'));
    } catch (err) {
        next(err);
    }
};
