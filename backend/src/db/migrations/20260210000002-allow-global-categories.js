export const up = async (queryInterface, Sequelize) => {
  await queryInterface.changeColumn('categories', 'groupId', {
    type: Sequelize.UUID,
    allowNull: true,
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.changeColumn('categories', 'groupId', {
    type: Sequelize.UUID,
    allowNull: false,
  });
};
