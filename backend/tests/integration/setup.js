import { beforeAll, afterAll } from 'vitest';
import { sequelize } from '../../src/db/sequelize.db.js';

beforeAll(async () => {
    // Ensure we are in test env
    if (process.env.NODE_ENV !== 'test') {
        process.env.NODE_ENV = 'test';
    }
    
    await sequelize.authenticate();
    
    // Fix for Postgres Enum types persistence across sync({force:true})
    // We must drop custom types explicitly as Sequelize sync doesn't drop them.
    try {
        await sequelize.query('DROP TYPE IF EXISTS "enum_users_role" CASCADE');
    } catch (e) {
        console.warn('Could not drop enum type, might not exist', e.message);
    }
    
    await sequelize.sync({ force: true });
});

afterAll(async () => {
    await sequelize.close();
});
