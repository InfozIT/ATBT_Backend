module.exports = (sequelize, DataTypes) => {
  const Form_Setting = sequelize.define('Form', {
    Data: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: "Name"
    },
    Tableview: {
      type: DataTypes.TEXT,
      allowNull: true
    }

  }, {
    // Other model options go here
  });

  return Form_Setting;
}