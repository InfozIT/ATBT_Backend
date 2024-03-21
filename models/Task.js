module.exports = (sequelize, DataTypes) => {
    const Task = sequelize.define('Task', {
        // Model attributes are defined here
        name: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: 'name',
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        createdBy: {
            type: DataTypes.STRING,
            allowNull: true,

        },
        customFieldsData: {
            type: DataTypes.JSON,
            allowNull: true
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        // Other model options go here
    });
    return Task;
}
