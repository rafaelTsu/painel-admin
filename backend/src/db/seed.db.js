import { sequelize } from './sequelize.db.js';
import { User } from '../models/index.model.js';
import { hashPassword } from '../services/auth.service.js';

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const email = 'admin@example.com';
    const password = 'password123';
    
    // Check if admin exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      console.log('Admin user already exists.');
      return;
    }

    const passwordHash = await hashPassword(password);
    
    await User.create({
      name: 'Admin User',
      email,
      passwordHash,
      role: 'administrator',
      isActive: true
    });

    console.log(`Admin user created: ${email} / ${password}`);
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    process.exit();
  }
};

seed();
