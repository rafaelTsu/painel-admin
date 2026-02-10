export const up = async (queryInterface, Sequelize) => {
  await queryInterface.addColumn('users', 'name', {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'User',
  });
  
  // Update specific known user if needed (optional since default takes care of it)
  // await queryInterface.bulkUpdate('users', { name: 'Administrator' }, { email: 'admin@example.com' });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.removeColumn('users', 'name');
};
