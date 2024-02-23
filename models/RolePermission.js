const { DataTypes } = require('sequelize');
const sequelize = require('../DB/dbconncet');


module.exports = (sequelize, DataTypes) => {
    const RolePermission = sequelize.define('RolePermission', {});
    return RolePermission
}
// module.exports = RolePermission;
