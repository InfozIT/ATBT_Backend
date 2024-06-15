module.exports = (sequelize, DataTypes) => {
    const Attchments = sequelize.define('Attchments', {
      ids: {
        type: DataTypes.STRING,
        allowNull: true
      },
      Name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Attchments: {
        type: DataTypes.STRING,
        allowNull: true
      }
  
    }, {
      // Other model options go here
    });
  
    return Attchments;
  }