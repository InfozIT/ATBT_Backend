module.exports = (sequelize, DataTypes) => {
    const Task = sequelize.define('Task', {
        // Model attributes are defined here
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
          members: {
            type: DataTypes.JSON,
            allowNull: true
            // allowNull defaults to true
          },
        dueDate: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            allowNull: true
        },

        file: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        // Other model options go here
    });
    return Task;
}
