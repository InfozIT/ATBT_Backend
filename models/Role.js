const { DataTypes } = require('sequelize');
const sequelize = require('../DB/dbconncet');

module.exports = (sequelize, DataTypes) => {
const Role = sequelize.define('Role', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
});
return Role
}
// module.exports = Role;
