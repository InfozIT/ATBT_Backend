
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
    taskCreatedBy: {
      type: DataTypes.JSON,
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
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0

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
    }
  });

  Task.associate = (models) => {
    Task.belongsToMany(models.User, { through: 'TaskCollaborators', as: 'collaborators' });
    Task.belongsToMany(models.User, { through: 'TaskMembers', as: 'members' });
    Task.belongsTo(models.User, { foreignKey: 'createdby', as: 'creator' });
  };

  return Task;
};
