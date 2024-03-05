require('dotenv').config();
var db = require('../models/index');
const Entite = db.Entite;
const { Op } = require('sequelize');

const mycon = require('../DB/mycon')
const nodemailer = require('nodemailer');

const CreateAdmin = async (req, res) => {
  try {
      console.log(req.file, req.body, "multer")
      const data = req.body;
      const user = {
          ...data,
          image: `${process.env.IMAGE_URI}/images/${req.file.filename}`,
      };

      mycon.query('INSERT INTO Entities SET ?', user, async (err, result) => {
          if (err) {
              console.error('Error inserting data: ' + err.stack);
              return res.status(500).send('Error inserting data');
          }
              res.status(201).send(`${result.insertId}`);

      });
  } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).send("Error creating user");
  }
};
const List_Entite = async (req, res) => {
  // Extract query parameters
  const page = parseInt(req.query.page) || 1; // Default page is 1
  const pageSize = parseInt(req.query.pageSize) || 5; // Default page size is 5
  const sortBy = req.query.sortBy || 'createdAt'; // Default sorting by createdAt if not provided
  const search = req.query.search || ''; // Default search is empty strin

  let filter = req.body.filters || '';

  // Calculate offset
  const offset = (page - 1) * pageSize;

  // MySQL query to fetch paginated users
  let sql = `SELECT * FROM Entities WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%')`;

  // Add conditions for additional filter fields
  if(!!filter){
   for (const [field, value] of Object.entries(filter)) {
      if (value !== '') {
          sql += ` AND ${field} LIKE '%${value}%'`; // Add the condition
      }
      
  }
  }
  // else{
  //      sql +=  `SELECT * FROM Users`;
  // }


  sql += ` ORDER BY ${sortBy} DESC LIMIT ?, ?`;

  mycon.query(sql, [offset, pageSize], (err, result) => {
      if (err) {
          console.error('Error executing MySQL query: ' + err.stack);
          res.status(500).json({ error: 'Internal server error' });
          return;
      }

      // Execute the count query to get the total number of users
      let sqlCount = `SELECT COUNT(*) as total FROM Entities WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%')`;

      // Add conditions for additional filter fields
      if(!!filter){
      for (const [field, value] of Object.entries(filter)) {
          if (value !== '') {
              sqlCount += ` AND ${field} LIKE '%${value}%'`; 
          }
      }
  }
  // else{
  //     sqlCount += `SELECT COUNT(*) as total FROM Users`;
  // }

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

const Get_Entite = (req, res) => {
  const entityId = req.params.id;
  mycon.query('SELECT * FROM Entities WHERE id = ?', entityId, (err, result) => {
    if (err) {
      console.error('Error retrieving data: ' + err.stack);
      res.status(500).send('Error retrieving data');
      return;
    }

    if (result.length === 0) {
      res.status(404).send('Entity data not found');
      return;
    }

    res.status(200).json(result[0]);
  });
};

const Update_Entite = (req, res) => {  try {
  const { id } = req.params;
  let data = req.body;
  let file = req.file;

  console.log(data, file, "update data");
  data = {
      image: `${process.env.IMAGE_URI}/images/${req.file.filename}`,
      ...data
  }

  // Define the SQL query to update the user
  const updateQuery = `UPDATE Entities SET ? WHERE id = ?`;

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
}}



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