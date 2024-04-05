
module.exports = (sequelize, DataTypes) => {
    const UserAccess = sequelize.define('UserAccess', {

        id: {
    
            type: DataTypes.INTEGER,
    
            primaryKey: true,
    
            autoIncrement: true
    
        },
    
        user_id: {
    
            type: DataTypes.INTEGER,
    
            allowNull: false
    
        },
    
        entity_id: DataTypes.INTEGER,
    
        selected_users: DataTypes.TEXT
    
    }, {
      // Other model options go here
    });
    return UserAccess;
  }