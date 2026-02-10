export const up = async (queryInterface, Sequelize) => {
  await queryInterface.changeColumn('variables', 'groupId', {
    type: Sequelize.UUID,
    allowNull: true,
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.changeColumn('variables', 'groupId', {
    type: Sequelize.UUID,
    allowNull: false,
  });
};
