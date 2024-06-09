const { DataTypes } = require('sequelize');
const sequelize = require('../DB/dbconncet');


module.exports = (sequelize, DataTypes) => {
    const Reports = sequelize.define('Reports', {
        reportName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        reportData: {
            type: DataTypes.JSON,
            allowNull: true
            // allowNull defaults to true
        },
        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
        }
    });
  

    return Reports;
  };
  
