import { migrateJunctions } from './src/db/migrate-junctions.js';
import { sequelize } from './src/db/sequelize.db.js';

// Wait for DB to be ready
setTimeout(async () => {
    await sequelize.sync(); // Ensure tables
    await migrateJunctions();
    process.exit(0);
}, 2000);
