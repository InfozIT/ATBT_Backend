// module.exports = (sequelize, DataTypes) => {
//   const Task = sequelize.define('Task', {
//     // Model attributes are defined here
//     decision: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     meetingId: {
//       type: DataTypes.STRING,
//       allowNull: true
//     },
//     priority: {
//       type: DataTypes.STRING,
//       allowNull: true
//     },
//     members: {
//       type: DataTypes.JSON,
//       allowNull: true
//       // allowNull defaults to true
//     },
//     dueDate: {
//       type: DataTypes.STRING,
//       allowNull: true
//     },
//     status: {
//       type: DataTypes.STRING,
//       allowNull: true,
//       defaultValue: "To-Do",
//     },
//     stat: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     collaborators: {
//       type: DataTypes.INTEGER,
//       allowNull: true
//     },
//     taskCreateby: {
//       type: DataTypes.JSON,
//       allowNull: true
//     },
//     file: {
//       type: DataTypes.STRING,
//       allowNull: true
//     },
//     createdby: {
//       type: DataTypes.INTEGER,
//       allowNull: true
//     },
//   }, {
//     // Other model options go here
//   });
//   return Task;
// }


module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    decision: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    meetingId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    priority: {
      type: DataTypes.STRING,
      allowNull: true
    },
    dueDate: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "To-Do",
    },
    stat: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    file: {
      type: DataTypes.STRING,
      allowNull: true
    },
    createdby: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    members: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    collaborators: {
      type: DataTypes.JSON, // Assuming collaborators is stored as JSON array
      allowNull: true
    }
  });

  Task.associate = (models) => {
    Task.belongsToMany(models.User, { through: 'TaskCollaborators', as: 'collaborators' });
    Task.belongsToMany(models.User, { through: 'TaskMembers', as: 'members' });
    Task.belongsTo(models.User, { foreignKey: 'createdby', as: 'creator' });
  };

  return Task;
};
