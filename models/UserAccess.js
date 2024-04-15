
module.exports = (sequelize, DataTypes) => {
    const UserAccess = sequelize.define('UserAccess', {

        id: {
    
            type: DataTypes.INTEGER,
    
            primaryKey: true,
    
            autoIncrement: true
    
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: 'name',
          },
          description: {
            type: DataTypes.STRING,
            // allowNull defaults to true
            allowNull: true
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