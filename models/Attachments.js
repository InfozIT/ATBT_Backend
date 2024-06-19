module.exports = (sequelize, DataTypes) => {
    const Attachments = sequelize.define('Attachments', {

      Attachments: {
        type: DataTypes.STRING,
        allowNull: true
      },
      TaskId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      MeetingId: {
      type: DataTypes.STRING,
      allowNull: true
     },
  
    },);
  
    return Attachments;
  }