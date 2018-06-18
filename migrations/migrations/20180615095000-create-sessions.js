module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface
      .createTable('sessions', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        userId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        token: {
          type: Sequelize.STRING(500),
          allowNull: false
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      })
      .then(() => queryInterface.addIndex('sessions', ['token'])),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('sessions')
};
