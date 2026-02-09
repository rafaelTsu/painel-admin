# Database Migrations

Use `npm run db:migrate` to run migrations.
Use `npm run db:migrate:undo` to undo the last migration.

To create a new migration, create a file in this folder with name `YYYYMMDDHHMMSS-name.js`.

Template:
```js
export const up = async (queryInterface, Sequelize) => {
  // await queryInterface.createTable('users', { id: Sequelize.UUID ... });
};

export const down = async (queryInterface, Sequelize) => {
  // await queryInterface.dropTable('users');
};
```
