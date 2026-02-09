import { User } from '../models/index.model.js';
import { hashPassword } from './auth.service.js';
import { ConflictError, NotFoundError } from '../shared/errors.util.js';
import { paginate } from '../shared/pagination.util.js';
import { Op } from 'sequelize';

export const listUsers = async ({ page = 1, limit = 10, search, role, isActive }) => {
    const where = {};
    
    if (search) {
        where[Op.or] = [
            { name: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } }
        ];
    }
    
    if (role) {
        where.role = role;
    }

    if (isActive !== undefined) {
        where.isActive = isActive === 'true' || isActive === true;
    }

    return paginate(User, { page, limit }, { 
        where, 
        attributes: { exclude: ['passwordHash'] },
        order: [['createdAt', 'DESC']]
    });
};

export const getUserById = async (id) => {
    const user = await User.findByPk(id, {
        attributes: { exclude: ['passwordHash'] }
    });
    if (!user) throw new NotFoundError('User not found');
    return user;
};

export const createUser = async (data) => {
    const existing = await User.findOne({ where: { email: data.email } });
    if (existing) throw new ConflictError('Email already in use');

    const passwordHash = await hashPassword(data.password);
    
    const user = await User.create({
        ...data,
        passwordHash
    });

    const { passwordHash: _, ...result } = user.toJSON();
    return result;
};

export const updateUser = async (id, data) => {
    const user = await User.findByPk(id);
    if (!user) throw new NotFoundError('User not found');

    if (data.email && data.email !== user.email) {
        const existing = await User.findOne({ where: { email: data.email } });
        if (existing) throw new ConflictError('Email already in use');
    }

    if (data.password) {
        data.passwordHash = await hashPassword(data.password);
        delete data.password;
    }

    await user.update(data);
    
    const { passwordHash: _, ...result } = user.toJSON();
    return result;
};

export const deactivateUser = async (id) => {
    const user = await User.findByPk(id);
    if (!user) throw new NotFoundError('User not found');
    
    await user.update({ isActive: false });
    return user;
};
