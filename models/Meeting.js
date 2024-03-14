module.exports = (sequelize, DataTypes) => {
  const Meeting = sequelize.define('Meeting', {
    // Model attributes are defined here
    name: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: "Name"

    },
    time: {
      type: DataTypes.STRING,
      allowNull: true
    },
    venue: {
      type: DataTypes.STRING,
      // allowNull defaults to true
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
      type: DataTypes.STRING,
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