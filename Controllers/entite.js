require('dotenv').config();
var db = require('../models/index');
const Entite = db.Entite;
const { Op } = require('sequelize');

const bcrypt = require('bcrypt');
const mycon = require('../DB/mycon')




const CreateAdmin = async (req, res) => {
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

  mycon.query('INSERT INTO Entities SET ?', user, (err, result) => {
      if (err) {
          console.error('Error inserting data: ' + err.stack);
          return res.status(500).send('Error inserting data');
      }

      const id = result.insertId;
      res.status(201).send(`${id}`);
  });
};

const List_Entite =async (req, res) => {
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

  // // MySQL query to fetch paginated users
  const sqlCount = `SELECT COUNT(*) as total FROM Entities`;
  // const sql = `SELECT * FROM Users LIMIT ?, ?`;
  const sql = `SELECT * FROM Entities WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%') ORDER BY ${sortBy} DESC LIMIT ?, ? `;

  mycon.query(sql, [offset, pageSize], (err, result) => {
  if (err) {
      console.error('Error executing MySQL query: ' + err.stack);
      res.status(500).json({ error: 'Internal server error' });
      return;
  }
  // Process the result
});

  // Execute the count query to get the total number of users
  mycon.query(sqlCount, (err, countResult) => {
      if (err) {
          console.error('Error executing MySQL count query: ' + err.stack);
          res.status(500).json({ error: 'Internal server error' });
          return;
      }
      const totalUsers = countResult[0].total;
      const totalPages = Math.ceil(totalUsers / pageSize);

      // Execute the query to fetch paginated users
      mycon.query(sql, [offset, pageSize], (err, results) => {
          if (err) {
              console.error('Error executing MySQL query: ' + err.stack);
              res.status(500).json({ error: 'Internal server error' });
              return;
          }
          // Send paginated users along with pagination information as response
          res.json({
              users: results,
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



const Get_Entite = async (req, res) => {
  try {
    // Create an Admin with the given data
    const Entites = await Entite.findOne({
      where: {
        id: req.params.id
      }
    });
    res.status(200).json({ message: `your id is:${req.params.id}`, Entites });
  } catch (error) {
    // Handle any errors that occur during the Admin creation process
    console.error("Error creating :", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const Update_Entite = async (req, res) => {
  try {
    var data = req.body;
    await Entite.update(data, {
      where: { id: req.params.id }
    });
    res.status(200).json({ message: `updated successfully ${req.params.id}` });
  } catch (error) {
    // Handle any errors that occur during the Admin creation process
    console.error("Error creating admin:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const Delete_Entite = async (req, res) => {
  try {
    await Entite.destroy({
      where: { id: req.params.id },
      // truncate: true
    });

    res.status(200).json({ message: `deleted successfully ${req.params.id}` });
  } catch (error) {
    console.error("Error deleting:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { CreateAdmin, List_Entite, Update_Entite, Delete_Entite, Get_Entite }