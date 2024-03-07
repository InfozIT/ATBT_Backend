const { DataTypes } = require('sequelize');
const sequelize = require('../DB/dbconncet');

const db = {};

// db.Sequelize =Sequelize
db.sequelize = sequelize


// Importing models
db.Entite = require('./Entity')(sequelize, DataTypes);
db.From = require('./Form')(sequelize, DataTypes)
db.Meeting = require('./Meeting')(sequelize, DataTypes)
db.Team = require('./Team')(sequelize, DataTypes)
db.User = require('./User')(sequelize, DataTypes);
db.Role = require('./Role')(sequelize, DataTypes);
db.Module = require('./Module')(sequelize, DataTypes);
db.Permission = require('./Permission')(sequelize, DataTypes);
db.RoleModule = require('./RolePermission')(sequelize, DataTypes);
db.PermissionModule = require('./PermissionModule')(sequelize, DataTypes);

// Define associations
const Role = db.Role;
const Module = db.Module;
const Permission = db.Permission
const User = db.User

// Define associations
Role.belongsToMany(Permission, { through: 'RolePermission' });
Permission.belongsToMany(Role, { through: 'RolePermission' });


Permission.belongsToMany(Module, { through: db.PermissionModule }); // Verify that Permission model is defined properly
Module.belongsToMany(Permission, { through: db.PermissionModule });

User.belongsTo(Role);

// db.sequelize.sync({ force: true });
db.sequelize.sync();
console.log("All models were alter successfully.");
module.exports = db;
