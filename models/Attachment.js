module.exports = (sequelize, DataTypes) => {
    const Attchments = sequelize.define('Attchments', {

      Attchments: {
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
  
    return Attchments;
  }