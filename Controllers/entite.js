require('dotenv').config();
var db = require('../models/index');
const Entite = db.Entite;
const { Op } = require('sequelize');

const mycon = require('../DB/mycon')



const  CreateAdmin = (req, res) => {
  const data = req.body;
  // Insert data into the entitydata table
  mycon.query('INSERT INTO Entities SET ?', data, (err, result) => {
    if (err) {
    
      console.error('Error inserting data: ' + err.stack);
      res.status(500).send('Error inserting data');
      return;
    }
    const id = result.insertId;
    res.status(201).send(`${id}`);
  });
};
const List_Entite = async (req, res) => {
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
  const sqlCount = `SELECT COUNT(*) as total FROM Entities`;
  const sql = `SELECT * FROM Entities WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%') ORDER BY ${sortBy} DESC LIMIT ?, ? `;

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
          const totalEntities = countResult[0].total;
          const totalPages = Math.ceil(totalEntities / pageSize);

          res.json({
              Entities:  result,
              totalPages: totalPages,
              currentPage: page,
              pageSize: pageSize,
              totalEntities: totalEntities,
              startUser: startUser,
              endUser: endUser
          });
      });
  });
}

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
const Update_Entite = (req, res) => {
  const entityId = req.params.id;
  const newData = req.body;
  // Update data in the entitydata table based on the id
  mycon.query('UPDATE EntityData SET ? WHERE id = ?', [newData, entityId], (err, result) => {
    if (err) {
      console.error('Error updating data: ' + err.stack);
      res.status(500).send('Error updating data');
      return;
    }

    if (result.affectedRows === 0) {
      res.status(404).send('Entity data not found');
      return;
    }

    console.log('Updated ' + result.affectedRows + ' row(s)');
    res.status(200).send('Data updated successfully');
  });
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