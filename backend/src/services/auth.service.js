import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.model.js';
import { env } from '../env.config.js';
import { UnauthorizedError } from '../shared/errors.util.js';

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const verifyPassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

export const generateTokens = (user) => {
  const payload = { id: user.id, role: user.role, email: user.email };
  
  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user.id }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  
  return { accessToken, refreshToken };
};

export const login = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user || !user.isActive) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const isMatch = await verifyPassword(password, user.passwordHash);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const tokens = generateTokens(user);
  
  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  return { user, ...tokens };
};

export const refresh = async (token) => {
    try {
        const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
        const user = await User.findByPk(decoded.id);
        if (!user || !user.isActive) {
            throw new UnauthorizedError('Invalid refresh token');
        }
        
        const tokens = generateTokens(user);
        return { accessToken: tokens.accessToken }; 
    } catch (err) {
        throw new UnauthorizedError('Invalid refresh token');
    }
};
