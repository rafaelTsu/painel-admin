import { Sequelize } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';
import { env } from '../env.config.js';
import { sequelize } from './sequelize.db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const umzug = new Umzug({
  migrations: {
    glob: path.join(__dirname, 'migrations/*.js'),
    resolve: ({ name, path, context }) => {
      // Adjusted for ESM import
      return {
        name,
        up: async () => {
          const migration = await import(path);
          return migration.up(context, Sequelize);
        },
        down: async () => {
          const migration = await import(path);
          return migration.down(context, Sequelize);
        },
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

const run = async () => {
  const args = process.argv.slice(2);
  const undo = args.includes('--undo');
  
  try {
    if (undo) {
      await umzug.down();
      console.log('Migration undone');
    } else {
      await umzug.up();
      console.log('All migrations performed successfully');
    }
    process.exit(0);
  } catch (err) {
    console.error('Migration failed', err);
    process.exit(1);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
    run();
}

export { umzug }; 
