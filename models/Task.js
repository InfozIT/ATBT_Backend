
// module.exports = (sequelize, DataTypes) => {
//   const Task = sequelize.define('Task', {
//     decision: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     meetingId: {
//       type: DataTypes.STRING,
//       allowNull: true
//     },
//     taskCreatedBy: {
//       type: DataTypes.JSON,
//       allowNull: true
//     },
//     priority: {
//       type: DataTypes.STRING,
//       allowNull: true
//     },
//     dueDate: {
//       type: DataTypes.STRING,
//       allowNull: true
//     },
//     age: {
//       type: DataTypes.INTEGER,
//       allowNull: true,
//       defaultValue: 0

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
//     file: {
//       type: DataTypes.STRING,
//       allowNull: true
//     },
//     createdby: {
//       type: DataTypes.INTEGER,
//       allowNull: true
//     },
//     members: {
//       type: DataTypes.INTEGER,
//       allowNull: true
//     },
//     collaborators: {
//       type: DataTypes.JSON, // Assuming collaborators is stored as JSON array
//       allowNull: true
//     },
//     update_count: {
//       type: DataTypes.BOOLEAN,
//       allowNull: false,
//       defaultValue: false,
//     },
//     emailSent: {
//       type: DataTypes.BOOLEAN,
//       allowNull: false,
//       defaultValue: false,
//     },
//     taskCreatedBy: {
//       type: DataTypes.STRING,
//       allowNull: true,
//       defaultValue: null,
//     }
//   });

//   Task.associate = (models) => {
//     Task.belongsToMany(models.User, { through: 'TaskCollaborators', as: 'collaborators' });
//     Task.belongsToMany(models.User, { through: 'TaskMembers', as: 'members' });
//     Task.belongsTo(models.User, { foreignKey: 'createdby', as: 'creator' });
//     Task.hasOne(models.TaskLog, { foreignKey: 'taskId', as: 'log' });
//   };

//   Task.addHook('beforeUpdate', async (task, options) => {
//     console.log('Before update hook triggered for Task:', task.id);
//     const changedFields = task.changed();
  
//     if (changedFields && changedFields.length > 0) {
//       const log = await task.getLog();
  
//       const newChanges = changedFields.map((field) => ({
//         fieldChanged: field,
//         oldValue: task._previousDataValues[field],
//         newValue: task[field],
//         changedBy: options.userId,
//         changeDate: new Date(),
//       }));

//       console.log("newChanges", newChanges)
  
//       if (log) {
//         // Append changes to existing log
//         const updatedChanges = log.changes.concat(newChanges);
//         await log.update({ changes: updatedChanges });
//       } else {
//         // Create a new log entry
//         await models.TaskLog.create({
//           taskId: task.id,
//           changes: newChanges,
//         });
//       }
//     }
//   });
  
  

//   return Task;
// };



module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    decision: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    meetingId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    taskCreatedBy: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    priority: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dueDate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
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
      allowNull: true,
    },
    createdby: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    members: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    collaborators: {
      type: DataTypes.JSON, // Assuming collaborators is stored as JSON array
      allowNull: true,
    },
    update_count: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    emailSent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    taskCreatedBy: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
  });

  Task.associate = (models) => {
    Task.belongsToMany(models.User, { through: 'TaskCollaborators', as: 'collaborators' });
    Task.belongsToMany(models.User, { through: 'TaskMembers', as: 'members' });
    Task.belongsTo(models.User, { foreignKey: 'createdby', as: 'creator' });
    Task.hasOne(models.TaskLog, { foreignKey: 'taskId', as: 'log' });
  };

  const getArrayAdditions = (oldArray, newArray) => {
    return newArray.filter(item => !oldArray.includes(item));
  };
  
  const getArrayRemovals = (oldArray, newArray) => {
    return oldArray.filter(item => !newArray.includes(item));
  };
  
  Task.addHook('beforeUpdate', async (task, options) => {
    console.log('Before update hook triggered for Task:', task.id);
    const changedFields = task.changed();
  
    if (changedFields && changedFields.length > 0) {
      const log = await sequelize.models.TaskLog.findOne({ where: { taskId: task.id } });
  
      const newChanges = [];
  
      changedFields.forEach((field) => {
        // Exclude logging updatedAt field
        if (field === 'updatedAt') {
          return;
        }
  
        let oldValue = task._previousDataValues[field];
        let newValue = task[field];
  
        if (field === 'collaborators' && Array.isArray(oldValue) && Array.isArray(newValue)) {
          const additions = getArrayAdditions(oldValue, newValue);
          const removals = getArrayRemovals(oldValue, newValue);
  
          additions.forEach(addition => {
            newChanges.push({
              fieldChanged: field,
              oldValue: null,
              newValue: addition,
              changedBy: options.userId,
              changeDate: new Date(),
              action: 'added',
            });
          });
  
          removals.forEach(removal => {
            newChanges.push({
              fieldChanged: field,
              oldValue: removal,
              newValue: null,
              changedBy: options.userId,
              changeDate: new Date(),
              action: 'removed',
            });
          });
        } else {
          newChanges.push({
            fieldChanged: field,
            oldValue: oldValue,
            newValue: newValue,
            changedBy: options.userId,
            changeDate: new Date(),
          });
        }
      });
  
      console.log("newChanges", newChanges);
  
      if (log) {
        // Append changes to existing log
        const updatedChanges = log.changes.concat(newChanges);
        await log.update({ changes: updatedChanges });
      } else {
        // Create a new log entry
        await sequelize.models.TaskLog.create({
          taskId: task.id,
          changes: newChanges,
        });
      }
    }
  });
  
  return Task;
  
};
