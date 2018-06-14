module.exports = (sequelize, DataTypes) => {
  const albums = sequelize.define(
    'albums',
    {
      id: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {}
  );

  albums.associate = models => {
    models.albums.belongsToMany(models.users, { through: 'users_albums' });
  };

  return albums;
};
