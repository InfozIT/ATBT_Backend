module.exports = (sequelize, DataTypes) => {
  const Meeting = sequelize.define('Meeting', {
    // Model attributes are defined here
    meetingnumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date: {
      type: DataTypes.STRING,
      allowNull: true
    },
    members: {
      type: DataTypes.JSON,
      allowNull: true
      // allowNull defaults to true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,

    },
    customFieldsData: {
      type: DataTypes.JSON,
      allowNull: true
    },

  }, {
    // Other model options go here
  });
  return Meeting;
}
