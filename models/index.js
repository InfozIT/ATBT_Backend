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
db.SubTask = require('./Subtask')(sequelize, DataTypes);
db.SubTaskDoc = require('./TaskSubDoc')(sequelize, DataTypes);
db.Reports = require('./reports')(sequelize, DataTypes);

db.UserAccess = require('./UserAccess')(sequelize, DataTypes);

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
const SubTask = db.SubTask
const SubTaskDoc = db.SubTaskDoc


// Define associations
Role.belongsToMany(Permission, { through: 'RolePermission' });
Permission.belongsToMany(Role, { through: 'RolePermission' });


Permission.belongsToMany(Module, { through: db.PermissionModule });
Module.belongsToMany(Permission, { through: db.PermissionModule });

User.belongsTo(Role);

Entity.hasMany(User); // One Entity can have many Users
User.belongsTo(Entity);


User.belongsToMany(Team, { through: "UserTeam" });
Team.belongsToMany(User, { through: "UserTeam" });

// Meet Association

Entity.hasMany(Meeting); // One Entity can have many Meetings
Meeting.belongsTo(Entity);

Team.hasMany(Meeting); // One Entity can have many Meetings
Meeting.belongsTo(Team);

User.hasMany(Meeting); // One user can have many Meetings
Meeting.belongsTo(User);

Task.hasMany(SubTask,{ onDelete: 'CASCADE' }); // One Task can have many Subtask
SubTask.belongsTo(Task);

// Comment and Uplods

// Task.hasMany(SubTaskDoc,{ onDelete: 'CASCADE' }); // One Task can have many Subtask
// SubTaskDoc.belongsTo(Task);

// SubTask.hasMany(SubTaskDoc,{ onDelete: 'CASCADE' }); // One Task can have many Subtask
// SubTaskDoc.belongsTo(SubTask);




db.sequelize.sync();
console.log("All models were alter successfully.");
module.exports = db;
