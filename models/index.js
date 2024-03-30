const { DataTypes } = require('sequelize');
const sequelize = require('../DB/dbconncet');

const db = {};

// db.Sequelize =Sequelize
db.sequelize = sequelize


// Importing models
// modules
db.Entity = require('./Entity')(sequelize, DataTypes);
db.From = require('./Form')(sequelize, DataTypes);
db.Meeting = require('./Meeting')(sequelize, DataTypes);
db.Team = require('./Team')(sequelize, DataTypes);
db.User = require('./User')(sequelize, DataTypes);
db.Task = require('./Task')(sequelize, DataTypes);

// module associations with user module


// role
db.Role = require('./Role')(sequelize, DataTypes);
db.Module = require('./Module')(sequelize, DataTypes);
db.Permission = require('./Permission')(sequelize, DataTypes);
db.RoleModule = require('./RolePermission')(sequelize, DataTypes);
db.PermissionModule = require('./PermissionModule')(sequelize, DataTypes);

// Define associations
const Role = db.Role;
const Module = db.Module;
const Permission = db.Permission
const Entity = db.Entity
const Meeting = db.Meeting
const Team = db.Team
const User = db.User
const Task = db.Task


// Define associations
Role.belongsToMany(Permission, { through: 'RolePermission' });
Permission.belongsToMany(Role, { through: 'RolePermission' });


Permission.belongsToMany(Module, { through: db.PermissionModule });
Module.belongsToMany(Permission, { through: db.PermissionModule });

User.belongsTo(Role);


User.belongsToMany(Entity, { through: "UserEntity" });
Entity.belongsToMany(User, { through: "UserEntity" });

Entity.hasMany(Meeting); // One Entity can have many Meetings
Meeting.belongsTo(Entity);

Team.hasMany(Meeting); // One Entity can have many Meetings
Meeting.belongsTo(Team);




db.sequelize.sync({alter:true});
console.log("All models were alter successfully.");
module.exports = db;
