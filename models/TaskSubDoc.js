module.exports = (sequelize, DataTypes) => {
    const TaskSubDoc = sequelize.define('TaskSubDoc', {
        // Model attributes are defined here
        senderid: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        Comment: {
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
    return TaskSubDoc;
}
