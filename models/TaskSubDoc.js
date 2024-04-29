module.exports = (sequelize, DataTypes) => {
    const TaskSubDoc = sequelize.define('TaskSubDoc', {
        // Model attributes are defined here
        senderId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        massage: {
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
