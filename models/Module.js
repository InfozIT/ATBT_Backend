const { DataTypes } = require('sequelize');
const sequelize = require('../DB/dbconncet');

module.exports = (sequelize, DataTypes) => {
    const Module = sequelize.define('Module', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
    });
    return Module
}
// module.exports = Module;
