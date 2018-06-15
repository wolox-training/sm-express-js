module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define(
    'sessions',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {}
  );

  users.associate = models => {
    models.sessions.belongsTo(models.users);
  };

  return users;
};
