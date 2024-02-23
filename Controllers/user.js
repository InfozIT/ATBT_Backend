var db = require('../models/index');
const sequelize = require('../DB/dbconncet');
const mycon = require('../DB/mycon')

const bcrypt = require('bcrypt');
const transporter = require('../utils/nodemailer');
const User = db.User;
const UserFormStructure = db.From
const { Op } = require('sequelize');
const queryInterface = sequelize.getQueryInterface();



// const Create_User = async (req, res) => {
//     const mailData = {
//         from: 'nirajkr00024@gmail.com',
//         to: req.body.email,
//         subject: 'Sending Email using Node.js',
//         text: 'User Created!',
//         html: `<b>Hey there your account has been created please use the below credentials to login</b><br><a href="https://main.d4f46sk4x577g.amplifyapp.com/login">login</a></b><br>email:${req.body.email} password: ${req?.body?.password ?? "suadmin"}<br/>`,
//     };
//     try {
//         var data = (req.body);
//         const role = await db.Role.findOne({
//             where: {
//                 name: data.role,
//             },
//         });
//         if (!role) {
//             console.error("Role not found.");
//             return;
//         }
//         const user = await User.create({
//             ...data,
//             RoleId: role.id,
//         });
//         transporter.sendMail(mailData, function (err, info) {
//             if (err)
//                 res.status(500).json({ error: err.message });
//             else
//                 res.json({ message: `mail send to your respected mail ${req.body.email}` });
//         });
//         const id = user.id; 
//         res.status(201).send(`${id}`);
//     } catch (error) {
//         console.error("Error creating user:", error);
//         res.status(500).json({ error: "Error creating user" });
//     }
// };

const Create_User = (req, res) => {
    const data = req.body;
    console.log(data)
    // Insert data into the Userdata table
    mycon.query('INSERT INTO Users SET ?', data, (err, result) => {
      if (err) {
      
        console.error('Error inserting data: ' + err.stack);
        res.status(500).send('Error inserting data');
        return;
      }
  
      const id = result.insertId;
      // res.status(200).send(`Data inserted successfully with id : ${id}`);
      res.status(201).send(`${id}`);
    });
  };
  

const List_User = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const pageSize = parseInt(req.query.pageSize, 10) || 10;
        const sortBy = req.query.sortBy || 'createdAt'; // Default sorting by createdAt if not provided
        const searchQuery = req.query.search || '';

        const options = {
            offset: (page - 1) * pageSize,
            limit: pageSize,
            order: sortBy === 'name' ? [['name']] : sortBy === 'email' ? [['email']] : [[sortBy]],
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${searchQuery}%` } },
                    { email: { [Op.like]: `%${searchQuery}%` } },
                    // Add more conditions based on your model's attributes
                ],
            },
        };
        // Add search condition dynamically based on your requirements
        if (searchQuery) {
            // Customize the where condition based on your model attributes
            options.where = {
                [Op.or]: [
                    { name: { [Op.like]: `%${searchQuery}%` } },
                    { email: { [Op.like]: `%${searchQuery}%` } },
                    // Add more conditions based on your model's attributes
                ],
            };
        }

        const totalUsers = await User.count({ where: options.where });
        const totalPages = Math.ceil(totalUsers / pageSize);
        const users = await User.findAll(options);

        // Calculate the range of users being displayed
        const startUser = (page - 1) * pageSize + 1;
        const endUser = Math.min(page * pageSize, totalUsers);

        res.status(200).json({
            users,
            totalUsers,
            totalPages,
            currentPage: page,
            pageSize,
            startUser,
            endUser,
        });
    } catch (error) {
        console.error("Error fetching Users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

async function Login_User(email, password) {
    try {
        const user = await User.findOne({
            where: {
                email
            }
        });
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            return user;
        } else {
            throw new Error('Authentication failed');
        }
    } catch (error) {
        throw error;
    }
}

const Get_User = async (req, res) => {
    try {
        // Create an User with the given data
        const user = await User.findOne({
            where: {
                id: req.params.id
            }
        });
        res.status(200).json({ message: `your id is:${req.params.id}`, user });
    } catch (error) {
        // Handle any errors that occur during the User creation process
        console.error("Error creating User:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const Update_User = async (req, res) => {
    try {
        var data = req.body;
        await User.update(data, {
            where: { id: req.params.id }
        });
        res.status(200).json({ message: `User updated successfully ${req.params.id}` });
    } catch (error) {
        // Handle any errors that occur during the User creation process
        console.error("Error creating User:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const Update_Password = async (req, res) => {
    try {
        const { newPassword } = req.body;

        // Ensure that the new password is provided
        if (!newPassword) {
            return res.status(400).json({ error: "New password is required" });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the user's password in the database
        await User.update({ password: hashedPassword }, {
            where: { id: req.params.id }
        });

        res.status(200).json({ message: `Password updated successfully for user ${req.params.id}` });
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const Reset_Password = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const mailData = {
            from: 'nirajkr00024@gmail.com',
            to: email,
            subject: 'Reset Password',
            html: `
                <p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
                <p>Please click on the following link, or paste this into your browser to complete the process:</p>
                <a href="https://main.d4f46sk4x577g.amplifyapp.com/changepassword/${user.id}">Reset Password Link</a>
                <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
            `,
        };

        await transporter.sendMail(mailData);

        res.status(200).json({ message: `Password reset link sent successfully to ${email}` });
    } catch (error) {

        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });

    }
}

const Delete_User = async (req, res) => {
    try {
        await User.destroy({
            where: { id: req.params.id },
            // truncate: true
        });

        res.status(200).json({ message: `User deleted successfully ${req.params.id}` });
    } catch (error) {
        console.error("Error deleting User:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


const createUserData = (req, res) => {
    const data = req.body;
    console.log(data)
    // Insert data into the Userdata table
    mycon.query('INSERT INTO UsersData SET ?', data, (err, result) => {
        if (err) {

            console.error('Error inserting data: ' + err.stack);
            res.status(500).send('Error inserting data');
            return;
        }

        const id = result.insertId;
        // res.status(200).send(`Data inserted successfully with id : ${id}`);
        res.status(201).send(`${id}`);
    });
};

module.exports = {
    Create_User,
    Login_User,
    List_User,
    Get_User,
    Update_User,
    Update_Password,
    Reset_Password,
    Delete_User,
    createUserData
};
