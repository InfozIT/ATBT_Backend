require('dotenv').config();
var db = require('../models/index');
const bcrypt = require('bcrypt');
const User = db.User;
const mycon = require('../DB/mycon')
const transporter = require('../utils/nodemailer')
const saltRounds = 10;
const { Role, Module, Permission } = require('../models/index');
const { generateToken } = require('../utils/utils');
const { json } = require('sequelize');

const Create_User = async (req, res) => {
    try {
        console.log(req.file, req.body, "multer")
        const { email, role: roleName } = req.body;
        let { entityname, ...data } = req.body;
        console.log(data, "remove name: entityname")
        const file = req.file;
        const password = generateRandomPassword();

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        // Check if the email already exists
        const existingUser = await db.User.findOne({ where: { email } });
        if (existingUser) {
            console.error("Email already exists.");
            return res.status(400).send("Email already exists");
        }
        const getEntity = await db.Entity.findOne({ where: { id: entityname } });
        console.log(getEntity, "getEntity")
        // Retrieve role from the database
        const role = await db.Role.findOne({ where: { name: roleName } });
        if (!role) {
            console.error("Role not found.");
            return res.status(404).send("Role not found");
        }

        if (file) {
            data = {
                image: `${process.env.IMAGE_URI}/images/${req.file.filename}`,
                ...data,
            }
        }
        // Insert user data into the database
        const user = {
            RoleId: role.id,
            password: hashedPassword,
            ...data
        };

        mycon.query('INSERT INTO Users SET ?', user, async (err, result) => {
            if (err) {
                console.error('Error inserting data: ' + err.stack);
                return res.status(500).send('Error inserting data');
            }

            try {
                // Send email to the user
                const createdUser = await db.User.findOne({ where: { email } });
                if (getEntity) {
                    await createdUser.setEntity(getEntity);
                }
                await sendEmail(email, password);
                res.status(201).send(`${result.insertId}`);
            } catch (emailError) {
                console.error("Error sending email:", emailError);
                res.status(500).send("Error sending email to user");
            }
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).send("Error creating user");
    }
};
// Function to generate a random password
function generateRandomPassword() {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < 10; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
}
// Function to send email
async function sendEmail(email, password) {

    const mailData = {
        from: 'nirajkr00024@gmail.com',
        to: email,
        subject: 'Welcome to ATBT! Your Account has been Created',
        html: `
            <style>
                /* Add CSS styles here */
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: Arial, sans-serif;
                    background-color: #f9f9f9;
                }
                .logo {
                    max-width: 100px;
                    margin-bottom: 20px;
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #007bff;
                    color: #fff;
                    text-decoration: none;
                    border-radius: 5px;
                }
                .button:hover {
                    background-color: #0056b3;
                }
                p {
                    margin-bottom: 15px;
                }
            </style>
            <div class="container">
                <img src="https://atbtmain.teksacademy.com/images/logo.png" alt="Your Company Logo" class="logo" />
                <p>Hi there,</p>
                <p>Welcome to ATBT! Your account has been successfully created.</p>
                <p>Here are your account details:</p>
                <ul style="list-style: none;">
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Password:</strong> ${password}</li>
                    <li>
                    <a href="https://www.betaatbt.infozit.com/" class="button" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Login</a>
                    </li>
                    <!-- You can add more user details here if needed -->
                </ul>
                <p>Feel free to explore our platform and start enjoying our services.</p>
                <p>If you have any questions or need assistance, don't hesitate to contact us.</p>
                <p>Thank you for choosing YourCompany!</p>
                <p>Best regards,</p>
                <p>Your Company Team</p>
            </div>
        `,
    };

    await transporter.sendMail(mailData);
}

const List_User = async (req, res) => {
    const { userId } = req.user;

    const { search = '', page = 1, pageSize = 5, sortBy = 'createdAt', ...restQueries } = req.query;

    const filters = {};

    for (const key in restQueries) {

        filters[key] = restQueries[key];

    }

    const offset = (parseInt(page) - 1) * parseInt(pageSize);

    const accessdata = await db.UserAccess.findOne({ where: { user_id: userId } });

    console.log(accessdata?.user_id ?? null, accessdata?.entity_id ?? null, "accessdata", accessdata)

    // MySQL query to fetch paginated users

    let sql;

    if (!!accessdata && !accessdata.selected_users && !accessdata.entity_id) {

        sql = `SELECT * FROM Users WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%')`

    } else if (!!accessdata && !accessdata.selected_users && accessdata.entity_id) {
        let entityIds = [...JSON.parse(accessdata.entity_id)]
        console.log(entityIds, typeof (entityIds), "entityIds")

        sql = `SELECT * FROM Users WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%') AND EntityId IN (${entityIds.join(',')})`;

    } else if (!!accessdata && !!accessdata.selected_users && !accessdata.entity_id) {

        let userIDs = [...JSON.parse(accessdata.selected_users), userId]
        console.log(userIDs, typeof (userIDs), "userIDs")

        sql = `SELECT * FROM Users WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%') AND id IN (${userIDs.join(',')})`;

    } else if (!accessdata) {

        // sql = `SELECT * FROM Users WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%') AND id IN (${userId})`;
        sql = `SELECT * FROM Users WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%') AND id = '${userId}'`;


    }

    // let sql = `SELECT * FROM Users WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%' )`;


    // Add conditions for additional filter fields

    for (const [field, value] of Object.entries(filters)) {

        if (value !== '') {

            sql += ` AND ${field} LIKE '%${value}%'`; // Add the condition

        }

    }

    // Add LIMIT and OFFSET clauses to the SQL query

    sql += ` ORDER BY ${sortBy} LIMIT ? OFFSET ?`;

    mycon.query(sql, [parseInt(pageSize), offset], (err, result) => {

        if (err) {

            console.error('Error executing MySQL query: ' + err.stack);

            res.status(500).json({ error: 'Internal server error' });

            return;

        }

        // Execute the count query to get the total number of users

        let sqlCount;

        if (!!accessdata && !accessdata.selected_users && !accessdata.entity_id) {

            sqlCount = `SELECT COUNT(*) as total FROM Users WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%')`;

        } else if (!!accessdata && !accessdata.selected_users && accessdata.entity_id) {
            let entityIds = [...JSON.parse(accessdata.entity_id)]

            sqlCount = `SELECT COUNT(*) as total FROM Users WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%') AND EntityId IN (${entityIds.join(',')})`;

        } else if (!!accessdata && !!accessdata.selected_users && !accessdata.entity_id) {

            let userIDs = [...JSON.parse(accessdata.selected_users), userId]

            sqlCount = `SELECT COUNT(*) as total FROM Users WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%') AND id IN (${userIDs.join(',')})`;

        } else if (!accessdata) {

            // sql = `SELECT * FROM Users WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%') AND id IN (${userId})`;
            sqlCount = `SELECT COUNT(*) as total FROM Users WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%') AND id = '${userId}'`;


        }

        // let sqlCount = `SELECT COUNT(*) as total FROM Users WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%')`;

        // Add conditions for additional filter fields

        for (const [field, value] of Object.entries(filters)) {

            if (value !== '') {

                sqlCount += ` AND ${field} LIKE '%${value}%'`;

            }

        }

        mycon.query(sqlCount, async (err, countResult) => {

            if (err) {

                console.error('Error executing MySQL count query: ' + err.stack);

                res.status(500).json({ error: 'Internal server error' });

                return;

            }

            const totalUsers = countResult[0].total;

            const totalPages = Math.ceil(totalUsers / pageSize);

            res.json({

                users: result,

                totalPages: parseInt(totalPages),

                currentPage: parseInt(page),

                pageSize: parseInt(pageSize),

                totalUsers: parseInt(totalUsers),

                startUser: parseInt(offset) + 1, // Correct the start user index

                endUser: parseInt(offset) + parseInt(pageSize), // Correct the end user index

                search

            });

        });
    });

};


const List_User_Pub = async (req, res) => {
    const { search = '', page = 1, pageSize = 5, sortBy = 'createdAt', ...restQueries } = req.query;
    const filters = {};
    for (const key in restQueries) {
        filters[key] = restQueries[key];

    }
    const offset = (parseInt(page) - 1) * (parseInt(pageSize));

    // MySQL query to fetch paginated users

    let sql = `SELECT * FROM Users WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%')`;

    // Add conditions for additional filter fields

    for (const [field, value] of Object.entries(filters)) {

        if (value !== '') {

            sql += ` AND ${field} LIKE '%${value}%'`; // Add the condition

        }

    }
    mycon.query(sql, [offset, pageSize], (err, result) => {

        if (err) {

            console.error('Error executing MySQL query: ' + err.stack);

            res.status(500).json({ error: 'Internal server error' });

            return;
        }

        // Execute the count query to get the total number of users

        let sqlCount = `SELECT COUNT(*) as total FROM Users WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%')`;

        // Add conditions for additional filter fields

        for (const [field, value] of Object.entries(filters)) {

            if (value !== '') {

                sqlCount += ` AND ${field} LIKE '%${value}%'`;

            }

        }

        mycon.query(sqlCount, (err, countResult) => {

            if (err) {

                console.error('Error executing MySQL count query: ' + err.stack);

                res.status(500).json({ error: 'Internal server error' });

                return;

            }

            const totalUsers = countResult[0].total;

            const totalPages = Math.ceil(totalUsers / pageSize);

            const final = result.map(item => { return { name: item.name, id: item.id, email: item.email, image: item.image } });


            res.json({

                users: final,

                totalPages: parseInt(totalPages),

                currentPage: parseInt(page),

                pageSize: parseInt(pageSize),

                totalUsers: parseInt(totalUsers),

                startUser: parseInt(offset),

                endUser: parseInt(offset + pageSize),

                search

            });

        });

    });

};

async function Login_User(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const user = await User.findOne({
            where: {
                email
            }
        });
        if (!user) {
            return res.status(404).json({ message: 'user not found.' });
        }

        if (!user.userstatus) {
            return res.status(403).json({ message: 'Your account is inactive. Please contact the administrator.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const roleId = user.RoleId;

        const role = await Role.findOne({
            where: { id: roleId },
            include: [{
                model: Permission,
                include: [{
                    model: Module,
                    attributes: ['name']
                }],
                attributes: ['all', 'canCreate', 'canRead', 'canUpdate', 'canDelete']
            }]
        });

        if (!role) {
            return res.status(404).json({ message: "Role not found." });
        }

        const simplifiedRole = {
            id: role.id,
            name: role.name,
            description: role.description,
            Permissions: role.Permissions.map(permission => ({
                module: permission.Modules.length ?
                    permission.Modules[0].name
                    : null,
                all: permission.all,
                canCreate: permission.canCreate,
                canRead: permission.canRead,
                canUpdate: permission.canUpdate,
                canDelete: permission.canDelete,
            }))
        };

        const token = generateToken(user.id, user.RoleId);
        res.json({ role: simplifiedRole, user, token, success: true, message: "Login successful" });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "An unexpected error occurred." });
    }
}
const Get_User = async (req, res) => {
    try {
        // Execute the query using the promise wrapper
        const [rows] = await mycon.promise().query('SELECT * FROM Users WHERE id = ?', [req.params.id]);

        if (!rows.length) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = rows[0];
        res.status(200).json({ message: `Your id is: ${req.params.id}`, user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
// const Update_User = async (req, res) => {
//     try {
//         const { id } = req.params;
//         let data = req.body;
//         let file = req.file;
//         let image;
//         if (file) {
//             image = `${process.env.IMAGE_URI}/images/${req.file.filename}`;
//             data = {
//                 image,
//                 ...data
//             }
//         }

//         // Define the SQL query to update the user
//         const updateQuery = `UPDATE Users SET ? WHERE id = ?`;

//         // Execute the update query
//         mycon.query(updateQuery, [data, id], (error, updateResults) => {
//             if (error) {
//                 console.error("Error updating User:", error);
//                 return res.status(500).json({ error: "Internal Server Error" });
//             }
//             res.status(201).send(`${id}`);
//         });
//     } catch (error) {
//         console.error("Error updating User:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };

const Update_User = async (req, res) => {
    try {
        const { id } = req.params;
        const { role: roleName } = req.body;
        let data = req.body;
        const file = req.file;
        let image;

        // Find role in the database
        const role = await db.Role.findOne({ where: { name: roleName } });
        if (!role) {
            console.error("Role not found.");
            return res.status(404).send("Role not found");
        } else {
            data.RoleId = role.id;
        }

        // Check if file is uploaded
        if (file) {
            image = `${process.env.IMAGE_URI}/images/${req.file.filename}`;
            data.image = image;
        }

        // Define the SQL query to update the user
        const updateQuery = `UPDATE Users SET ? WHERE id = ?`;

        // Execute the update query
        mycon.query(updateQuery, [data, id], (error, updateResults) => {
            if (error) {
                console.error("Error updating User:", error);
                return res.status(500).json({ error: "Internal Server Error" });
            }
            res.status(201).json(`${id}`);
        });
    } catch (error) {
        console.error("Error updating User:", error);
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
            subject: 'Password Reset Request',
            html: `
                <style>
                    /* Add CSS styles here */
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        font-family: Arial, sans-serif;
                        background-color: #f9f9f9;
                    }
                    .banner {
                        margin-bottom: 20px;
                    }
                    .button {
                        display: inline-block;
                        padding: 10px 20px;
                        background-color: #007bff;
                        color: #fff;
                        text-decoration: none;
                        border-radius: 5px;
                    }
                    .button:hover {
                        background-color: #0056b3;
                    }
                    p {
                        margin-bottom: 15px;
                    }
                </style>
                <div class="container">
                    <p>Hi there,</p>
                    <img src="https://atbtmain.teksacademy.com/images/logo.png" alt="Infoz IT logo" class="banner" />
                    <p>We received a request to reset the password for your account.</p>
                    <p>If this was you, please click the button below to reset your password:</p>
                    <a href="https://www.betaatbt.infozit.com/changepassword/${user.id}" class="button"  style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
                    <p>If you didn't request this password reset, you can safely ignore this email.</p>
                    <p>Thank you,</p>
                    <p>Infoz IT Team</p>
                </div>
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



const RenewPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        bcrypt.compare(oldPassword, user.password, async (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            if (!result) {
                return res.status(401).json({ error: 'Old password is incorrect' });
            }
            let hashedNewPassword = await bcrypt.hash(newPassword, 10);

            await User.update({ password: hashedNewPassword }, {
                where: {
                    id: id
                }
            });

            res.status(200).json({ message: `Password reset successfully` });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = RenewPassword;


module.exports = {
    Create_User,
    Login_User,
    List_User,
    Get_User,
    Update_User,
    Update_Password,
    Reset_Password,
    Delete_User,
    List_User_Pub,
    RenewPassword
};
