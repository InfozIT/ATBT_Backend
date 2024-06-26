// const { DataTypes } = require("sequelize");

// module.exports = (sequelize, DataTypes) => {
//     const TaskLog = sequelize.define('TaskLog', {
//         taskId: {
//             type: DataTypes.INTEGER,
//             allowNull: false,
//         },
//         changes: {
//             type: DataTypes.JSON,
//             allowNull: false,
//             defaultValue: [],
//         },
//         updatedAt: {
//             type: DataTypes.DATE,
//             allowNull: false,
//             defaultValue: DataTypes.NOW,
//           },
//     });

//     TaskLog.associate = (models) => {
//         TaskLog.belongsTo(models.Task, {foreignKey: 'taskId', as: 'task'})
//     };

//     return TaskLog;
// }
  
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const TaskLog = sequelize.define('TaskLog', {
        taskId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        changes: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    });

    TaskLog.associate = (models) => {
        TaskLog.belongsTo(models.Task, { foreignKey: 'taskId', as: 'task' });
    };

    return TaskLog;
};


