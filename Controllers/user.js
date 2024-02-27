var db = require('../models/index');
const bcrypt = require('bcrypt');
const sequelize = require('../DB/dbconncet');
const transporter = require('../utils/nodemailer');
const User = db.User;
const mycon = require('../DB/mycon')


const Create_User = async (req, res) => {
    const data = req.body;
    const email = data.email;
    const password = email.split("@")[0]; // Initial password from email (You might want to change this)

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

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

//     // // MySQL query to fetch paginated users
//     const sqlCount = `SELECT COUNT(*) as total FROM Users`;
//     // const sql = `SELECT * FROM Users LIMIT ?, ?`;
//     const sql = `SELECT * FROM Users WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%') ORDER BY ${sortBy} DESC LIMIT ?, ? `;

//     mycon.query(sql, [offset, pageSize], (err, result) => {
//     if (err) {
//         console.error('Error executing MySQL query: ' + err.stack);
//         res.status(500).json({ error: 'Internal server error' });
//         return;
//     }
//     // Process the result
// });

//     // Execute the count query to get the total number of users
//     mycon.query(sqlCount, (err, countResult) => {
//         if (err) {
//             console.error('Error executing MySQL count query: ' + err.stack);
//             res.status(500).json({ error: 'Internal server error' });
//             return;
//         }
//         const totalUsers = countResult[0].total;
//         const totalPages = Math.ceil(totalUsers / pageSize);

//         // Execute the query to fetch paginated users
//         mycon.query(sql, [offset, pageSize], (err, results) => {
//             if (err) {
//                 console.error('Error executing MySQL query: ' + err.stack);
//                 res.status(500).json({ error: 'Internal server error' });
//                 return;
//             }

//             const a = results[1].userremarkshistory;
//             const b = JSON.parse(a)

//             res.json({
//                 users: b,
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

const List_User = async (req, res) => {
    // Extract query parameters
    const page = parseInt(req.query.page) || 1; // Default page is 1
    const pageSize = parseInt(req.query.pageSize) || 10; // Default page size is 10
    const sortBy = req.query.sortBy || 'createdAt'; // Default sorting by createdAt if not provided
    const search = req.query.search || ''; // Default search is empty string

    // Calculate offset
    const offset = (page - 1) * pageSize;
    // Calculate start and end users
    const startUser = offset;
    const endUser = offset + pageSize;

    // MySQL query to fetch paginated users
    const sqlCount = `SELECT COUNT(*) as total FROM Users`;
    const sql = `SELECT * FROM Users WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%') ORDER BY ${sortBy} DESC LIMIT ?, ? `;

    mycon.query(sql, [offset, pageSize], (err, result) => {
        if (err) {
            console.error('Error executing MySQL query: ' + err.stack);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
    
        // Execute the count query to get the total number of users
        mycon.query(sqlCount, (err, countResult) => {
            if (err) {
                console.error('Error executing MySQL count query: ' + err.stack);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            const totalUsers = countResult[0].total;
            const totalPages = Math.ceil(totalUsers / pageSize);

            res.json({
                users:  result,
                totalPages: totalPages,
                currentPage: page,
                pageSize: pageSize,
                totalUsers: totalUsers,
                startUser: startUser,
                endUser: endUser
            });
        });
    });
}




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

// const Get_User = async (req, res) => {
//     try {
//         // Execute the query using the promise wrapper
//         const [rows] = await mycon.promise().query('SELECT * FROM Users WHERE id = ?', [req.params.id]);

//         if (!rows.length) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         // Parse properties of type 'object' to JSON
//         const user = rows[0];
//         for (let prop in user) {
//             if (typeof user[prop] === 'TEXT') {
//                 try {
//                     user[prop] = JSON.parse(user[prop]);
//                 } catch (err) {
//                     console.error(`Error parsing JSON for property '${prop}':`, err);
//                     // Handle the error as needed, such as setting the property to null
//                     user[prop] = null;
//                 }
//             }
//         }

//         res.status(200).json({ message: `Your id is: ${req.params.id}`, user });
//     } catch (error) {
//         console.error('Error fetching user:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

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







// const Update_User = async (req, res) => {
//   try {
//     const { id } = req.params;
//     let data = req.body;
    
//     // Function to recursively stringify JSON objects
//     const stringifyJSONObjects = (obj) => {
//       for (let key in obj) {
//         if (typeof obj[key] === 'object') {
//           obj[key] = JSON.stringify(obj[key]);
//         }
//       }
//     };

//     // Convert JSON objects in data to JSON strings
//     stringifyJSONObjects(data);

//     // Define the SQL query to update the user
//     const updateQuery = `UPDATE Users SET ? WHERE id = ?`;

//     // Execute the update query
//     mycon.query(updateQuery, [data, id], (error, updateResults) => {
//       if (error) {
//         console.error("Error updating User:", error);
//         return res.status(500).json({ error: "Internal Server Error" });
//       }

//       // If the update was successful, fetch the updated user data
//       const selectQuery = `SELECT * FROM Users WHERE id = ?`;

//       mycon.query(selectQuery, id, (selectError, selectResults) => {
//         if (selectError) {
//           console.error("Error fetching updated User:", selectError);
//           return res.status(500).json({ error: "Internal Server Error" });
//         }

//         // Send the updated user data in the response
//         res.status(200).json({ message: `User updated successfully ${id} `});
//       });
//     });
//   } catch (error) {
//     console.error("Error updating User:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

const Update_User = async (req, res) => {
    try {
      const { id } = req.params;
      let data = req.body;
      
      // Function to recursively stringify JSON objects
      const stringifyJSONObjects = (obj) => {
        for (let key in obj) {
          if (typeof obj[key] === 'object') {
            obj[key] = JSON.stringify(obj[key]);
          }
        }
      };
  
      // Convert JSON objects in data to JSON strings
      stringifyJSONObjects(data);
  
      // Define the SQL query to update the user
      const updateQuery = `UPDATE Users SET ? WHERE id = ?`;
  
      // Execute the update query
      mycon.query(updateQuery, [data, id], (error, updateResults) => {
        if (error) {
          console.error("Error updating User:", error);
          return res.status(500).json({ error: "Internal Server Error" });
        }
  
        // If the update was successful, fetch the updated user data
        const selectQuery = `SELECT * FROM Users WHERE id = ?`;
  
        mycon.query(selectQuery, id, (selectError, selectResults) => {
          if (selectError) {
            console.error("Error fetching updated User:", selectError);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          const parsedUsers = selectResults.map(item => {
            const parsedHistory = JSON.parse(item.userremarkshistory)
            return {
                ...item,
                userremarkshistory:parsedHistory
            }
          });
  
          // Send the parsed user data in the response
          res.status(200).json({ message: `User updated successfully ${id}`, users: parsedUsers });
        });
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
