module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define('Team', {
    // Model attributes are defined here
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: 'email',
      validate: {
          isEmail: true
      }
  },
    description: {
      type: DataTypes.STRING,
      // allowNull defaults to true
      allowNull: true
    },
    members: {
      type: DataTypes.STRING,
      allowNull: true
      // allowNull defaults to true
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    // Other model options go here
  });
  return Team;
}