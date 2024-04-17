
module.exports = (sequelize, DataTypes) => {
    const UserAccess = sequelize.define('UserAccess', {

        id: {
    
            type: DataTypes.INTEGER,
    
            primaryKey: true,
    
            autoIncrement: true
    
        },
        userName: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          entityNames: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          selectedUsersNames: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          description: {
            type: DataTypes.STRING,

          },

    
        user_id: {
    
            type: DataTypes.INTEGER,
    
            allowNull: false
    
        },
    
        entity_id: DataTypes.TEXT,
    
        selected_users: DataTypes.TEXT
    
    }, {
      // Other model options go here
    });
    return UserAccess;
  }