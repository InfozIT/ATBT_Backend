const { DataTypes } = require('sequelize');
const sequelize = require('../DB/dbconncet');


module.exports = (sequelize, DataTypes) => {
  // Define Permission model
  const Permission = sequelize.define('Permission', {
    // name:DataTypes.STRING,
    all: DataTypes.BOOLEAN,
    create: DataTypes.BOOLEAN,
    read: DataTypes.BOOLEAN,
    update: DataTypes.BOOLEAN,
    delete: DataTypes.BOOLEAN
  });
  return Permission
}

// module.exports = Permission;