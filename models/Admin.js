const bcrypt = require('bcrypt');
const { DataTypes } = require('sequelize');
const sequelize = require('../DB/dbconncet');

module.exports = (sequelize, DataTypes) => {
const AdminUser = sequelize.define('AdminUser', {
  userName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    defaultValue: "suadmin",
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: 'email',
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: /^\d{10}$/
    }
  },
}, {
  hooks: {
    beforeCreate: async (adminUser) => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminUser.password, salt);
      adminUser.password = hashedPassword;
    }
  },
});

return AdminUser
}


// module.exports = AdminUser;
