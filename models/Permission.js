const { DataTypes } = require('sequelize');
const sequelize = require('../DB/dbconncet');


module.exports = (sequelize, DataTypes) => {
  // Define Permission model
  const Permission = sequelize.define('Permission', {
    // name:DataTypes.STRING,
    all: DataTypes.BOOLEAN,
    canCreate: DataTypes.BOOLEAN,
    canRead: DataTypes.BOOLEAN,
    canUpdate: DataTypes.BOOLEAN,
    canDelete: DataTypes.BOOLEAN
  });
  return Permission
}

// module.exports = Permission;