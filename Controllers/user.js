var db = require('../models/index');
const sequelize = require('../DB/dbconncet');
const transporter = require('../utils/nodemailer');
const User = db.User;
const mycon = require('../DB/mycon')
const UserFormStructure = db.From
const { Op } = require('sequelize');
const queryInterface = sequelize.getQueryInterface();



const Create_User = async (req, res) => {
    const data = req.body;
    const email = data.email;
    const password = email.split("@")[0]; // Initial password from email (You might want to change this)

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    console.log(data);
    const role = await db.Role.findOne({
        where: {
            name: data.role,
        },
    });
    if (!role) {
        console.error("Role not found.");
        return res.status(404).send("Role not found");
    }

    // Insert data into the Userdata table
    const user = {
        ...data,
        RoleId: role.id,
        password: hashedPassword, // Insert hashed password
    };

    mycon.query('INSERT INTO Users SET ?', user, (err, result) => {
        if (err) {
            console.error('Error inserting data: ' + err.stack);
            return res.status(500).send('Error inserting data');
        }

        const id = result.insertId;
        res.status(201).send(`${id}`);
    });
};

const List_User = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const pageSize = parseInt(req.query.pageSize, 10) || 10;
        const sortBy = req.query.sortBy || 'createdAt'; // Default sorting by createdAt if not provided
        const searchQuery = req.query.search || '';

        // Construct the SQL query
        let sqlQuery = `SELECT * FROM Users WHERE (name LIKE ? OR email LIKE ?)`;

        // Add sorting
        if (sortBy === 'name') {
            sqlQuery += ` ORDER BY name`;
        } else if (sortBy === 'email') {
            sqlQuery += ` ORDER BY email`;
        } else {
            sqlQuery += ` ORDER BY ${sortBy}`;
        }

        // Add pagination
        const offset = (page - 1) * pageSize;
        sqlQuery += ` LIMIT ? OFFSET ?`;

        // Execute the query using promises
        const result = await mycon.promise().query(sqlQuery, [`%${searchQuery}%`, `%${searchQuery}%`, pageSize, offset]);

        // Send the result back as response
        res.json(result[0]); // Assuming the result is an array in the first element

    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
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
