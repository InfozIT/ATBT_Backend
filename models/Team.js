module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define('Team', {
    // Model attributes are defined here
    name: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: 'name',
    },
    description: {
      type: DataTypes.STRING,
      // allowNull defaults to true
      allowNull: true
    },
    members: {
      type: DataTypes.JSON,
      allowNull: true
      // allowNull defaults to true
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: true,

    },
    customFieldsData: {
      type: DataTypes.JSON,
      allowNull: true
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
