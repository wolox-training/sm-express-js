module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'role', {
      type: Sequelize.ENUM('regular', 'admin'),
      allowNull: false,
      defaultValue: 'regular'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('users', 'role');
  }
};
