const bcrypt = require('bcrypt');
const { DataTypes } = require('sequelize');
const sequelize = require('../DB/dbconncet');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        role: {
            type: DataTypes.STRING,
            allowNull: true
        },
        designation: {
            type: DataTypes.STRING,
            allowNull: true
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
        phonenumber: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                is: /^\d{10}$/
            }
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,

        },
        userstatus: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true

            // allowNull defaults to true
        },
        userremarkshistory: {
            type: DataTypes.JSON,
            allowNull: true
            // allowNull defaults to true
        },
        createdBy: {
            type: DataTypes.STRING,
            allowNull: true,

        },
        customFieldsData: {
            type: DataTypes.JSON,
            allowNull: true
        },
        entityname: {
            type: DataTypes.STRING,
            allowNull: true,}

    }, {
        hooks: {
            beforeCreate: async (user) => {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(user.password, salt);
                user.password = hashedPassword;
            }
        },
        // timestamps: false // Disable timestamps
    });
    return User
}
