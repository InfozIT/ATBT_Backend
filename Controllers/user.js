require('dotenv').config();
var db = require('../models/index');
const bcrypt = require('bcrypt');
const sequelize = require('../DB/dbconncet');
const User = db.User;
const mycon = require('../DB/mycon')
const transporter = require('../utils/nodemailer')
const saltRounds = 10;
const formidable = require('formidable');


const Create_User = async (req, res) => {
    try {
        console.log(req.file, req.body, "multer")
        const { email, role: roleName } = req.body;
        const data = req.body;
        const password = generateRandomPassword();

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Retrieve role from the database
        const role = await db.Role.findOne({ where: { name: roleName } });
        if (!role) {
            console.error("Role not found.");
            return res.status(404).send("Role not found");
        }

        // Insert user data into the database
        const user = {
            ...data,
            image: `${process.env.IMAGE_URI}/images/${req.file.filename}`,
            RoleId: role.id,
            password: hashedPassword,
        };

        mycon.query('INSERT INTO Users SET ?', user, async (err, result) => {
            if (err) {
                console.error('Error inserting data: ' + err.stack);
                return res.status(500).send('Error inserting data');
            }

            try {
                // Send email to the user
                await sendEmail(email, password);

                // Respond with success message
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



// const List_User = async (req, res) => {
//     // Extract query parameters
//     const page = parseInt(req.query.page) || 1; // Default page is 1
//     const pageSize = parseInt(req.query.pageSize) || 10; // Default page size is 10
//     const sortBy = req.query.sortBy || 'createdAt'; // Default sorting by createdAt if not provided
//     const search = req.query.search || ''; // Default search is empty string

//     // Calculate offset
//     const offset = (page - 1) * pageSize;
//     // Calculate start and end users
//     const startUser = offset;
//     const endUser = offset + pageSize;

//     // MySQL query to fetch paginated users
//     const sqlCount = `SELECT COUNT(*) as total FROM Users`;
//     const sql = `SELECT * FROM Users WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%') ORDER BY ${sortBy} DESC LIMIT ?, ? `;

//     mycon.query(sql, [offset, pageSize], (err, result) => {
//         if (err) {
//             console.error('Error executing MySQL query: ' + err.stack);
//             res.status(500).json({ error: 'Internal server error' });
//             return;
//         }

//         // Execute the count query to get the total number of users
//         mycon.query(sqlCount, (err, countResult) => {
//             if (err) {
//                 console.error('Error executing MySQL count query: ' + err.stack);
//                 res.status(500).json({ error: 'Internal server error' });
//                 return;
//             }
//             const totalUsers = countResult[0].total;
//             const totalPages = Math.ceil(totalUsers / pageSize);

//             res.json({
//                 users: result,
//                 totalPages: totalPages,
//                 currentPage: page,
//                 pageSize: pageSize,
//                 totalUsers: totalUsers,
//                 startUser: startUser,
//                 endUser: endUser
//             });
//         });
//     });
// }

// const List_User = async (req, res) => {
//     // Extract query parameters
//     const page = parseInt(req.query.page) || 1; // Default page is 1
//     const pageSize = parseInt(req.query.pageSize) || 5; // Default page size is 5
//     const sortBy = req.query.sortBy || 'createdAt'; // Default sorting by createdAt if not provided
//     const search = req.query.search || ''; // Default search is empty string
//     const data = req.query.CustomFild || ''; // Corrected spelling for entityName

//     let filter = req.body.filters; 

    
//     // Calculate offset
//     const offset = (page - 1) * pageSize;

//     // MySQL query to fetch paginated users
//     let sql = `SELECT * FROM Users WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%')`;
//     // let sql = `SELECT * FROM Users WHERE 1`; // Start with a true condition

// for (const [field, value] of Object.entries(filter)) {
//     if (value !== '') {
//         sql += ` AND ${field} LIKE '%${value}%'`; // Add the condition
//     }
// }

// // Check if any condition was added
// if (sql === `SELECT * FROM Users WHERE 1`) {
//     sql += `SELECT * FROM Users`; // If no conditions were added, revert to the original SQL
// }


//     sql += ` ORDER BY ${sortBy} DESC LIMIT ?, ?`;

//     mycon.query(sql, [offset, pageSize], (err, result) => {
//         if (err) {
//             console.error('Error executing MySQL query: ' + err.stack);
//             res.status(500).json({ error: 'Internal server error' });
//             return;
//         }

//         // Execute the count query to get the total number of users
//         let sqlCount = `SELECT COUNT(*) as total FROM Users WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%')`;

//         // Add condition for EntityName
//         for (const [field, value] of Object.entries(filter)) {
//             if (value !== '') {
//                 sqlCount += ` AND ${field} LIKE '%${value}%'`; 
//             }
//         }
        

//         mycon.query(sqlCount, (err, countResult) => {
//             if (err) {
//                 console.error('Error executing MySQL count query: ' + err.stack);
//                 res.status(500).json({ error: 'Internal server error' });
//                 return;
//             }
//             const totalUsers = countResult[0].total;
//             const totalPages = Math.ceil(totalUsers / pageSize);

//             res.json({
//                 users: result,
//                 totalPages: totalPages,
//                 currentPage: page,
//                 pageSize: pageSize,
//                 totalUsers: totalUsers,
//                 startUser: offset,
//                 endUser: offset + pageSize
//             });
//         });
//     });
// };

const List_User = async (req, res) => {
    // Extract query parameters
    const page = parseInt(req.query.page) || 1; // Default page is 1
    const pageSize = parseInt(req.query.pageSize) || 5; // Default page size is 5
    const sortBy = req.query.sortBy || 'createdAt'; // Default sorting by createdAt if not provided
    const search = req.query.search || ''; // Default search is empty string

    // Corrected spelling for entityName
    const data = req.query.CustomFild || '';

    let filter = req.body.filters;

    // Calculate offset
    const offset = (page - 1) * pageSize;

    // MySQL query to fetch paginated users
    let sql = `SELECT * FROM Users WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%')`;

    // Add conditions for additional filter fields
    for (const [field, value] of Object.entries(filter)) {
        if (value !== '') {
            sql += ` AND ${field} LIKE '%${value}%'`; // Add the condition
        }
    }

    sql += ` ORDER BY ${sortBy} DESC LIMIT ?, ?`;

    mycon.query(sql, [offset, pageSize], (err, result) => {
        if (err) {
            console.error('Error executing MySQL query: ' + err.stack);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        // Execute the count query to get the total number of users
        let sqlCount = `SELECT COUNT(*) as total FROM Users WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%')`;

        // Add conditions for additional filter fields
        for (const [field, value] of Object.entries(filter)) {
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

            res.json({
                users: result,
                totalPages: totalPages,
                currentPage: page,
                pageSize: pageSize,
                totalUsers: totalUsers,
                startUser: offset,
                endUser: offset + pageSize
            });
        });
    });
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
        // Execute the query using the promise wrapper
        const [rows] = await mycon.promise().query('SELECT * FROM Users WHERE id = ?', [req.params.id]);

        if (!rows.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Parse "userremarkshistory" property to JSON
        const user = rows[0];
        if (user.userremarkshistory) {
            try {
                user.userremarkshistory = JSON.parse(user.userremarkshistory.replace(/\\"/g, '"'));
            } catch (err) {
                console.error('Error parsing "userremarkshistory" property:', err);
                // Handle the error as needed
            }
        }

        res.status(200).json({ message: `Your id is: ${req.params.id}`, user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const Update_User = async (req, res) => {
    try {
        const { id } = req.params;
        let data = req.body;
        let file = req.file;

        console.log(data, file, "update data");
        data = {
            image: `${process.env.IMAGE_URI}/images/${req.file.filename}`,
            ...data
        }

        // Define the SQL query to update the user
        const updateQuery = `UPDATE Users SET ? WHERE id = ?`;

        // Execute the update query
        mycon.query(updateQuery, [data, id], (error, updateResults) => {
            if (error) {
                console.error("Error updating User:", error);
                return res.status(500).json({ error: "Internal Server Error" });
            }
            res.status(200).json({ message: `User updated successfully ${id}` });

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

module.exports = {
    Create_User,
    Login_User,
    List_User,
    Get_User,
    Update_User,
    Update_Password,
    Reset_Password,
    Delete_User,
};
