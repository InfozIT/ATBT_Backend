const { DataTypes } = require('sequelize');
const sequelize = require('../DB/dbconncet');

module.exports = (sequelize, DataTypes) => {
    const PermissionModule = sequelize.define('PermissionModule', {});
    return PermissionModule
}
// module.exports = PermissionModule;

