var db = require('../models/index');
const Team = db.Team;
require('dotenv').config();
var db = require('../models/index');
const uploadToS3 = require('../utils/wearhouse')

const mycon = require('../DB/mycon')


const CreateTeam = async (req, res) => {
  try {
    let name = req.body.name
    let file = req.file;
    let data = req.body;
    const membersId = [4, 12]  // In future it will come from frontend
    const members = await db.User.findAll({
      where: {
        id: membersId
      }
    });
    const existingEntity = await db.Team.findOne({ where: { name } });
    console.log(name, existingEntity, "existin entity")
    if (existingEntity) {
      console.error("entity already exists.");
      return res.status(400).send("entity already exists");
    }
    if (file) {
      const result = await uploadToS3(req.file.buffer);

      data = {
        image: `${result.Location}`,
        ...data,
      }
    }
    mycon.query('INSERT INTO Teams SET ?', data, async (err, result) => {
      if (err) {
        console.error('Error inserting data: ' + err.stack);
        return res.status(500).send('Error inserting data');
      }
      const createdEntity = await db.Team.findOne({ where: { id: result.insertId } });
      if (createdEntity && members) {
        await createdEntity.addUsers(members);
      }
      res.status(201).send(`${result.insertId}`);

    });
  } catch (error) {
    console.error("Error creating Entity:", error);
    res.status(500).send("Error creating user");
  }
};

const UpdateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    let data = req.body;
    let file = req.file;
    let image;
    if (file) {
      const result = await uploadToS3(req.file.buffer);

      image = `${result.Location}`;
      data = {
        image,
        ...data
      }
    }

    // Define the SQL query to update the Teams
    const updateQuery = `UPDATE Teams SET ? WHERE id = ?`;

    // Execute the update query
    mycon.query(updateQuery, [data, id], (error, updateResults) => {
      if (error) {
        console.error("Error updating Teams:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.status(201).send(`${id}`);
    });
  } catch (error) {
    console.error("Error updating Teams:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const DeleteTeamById = async (req, res) => {
  const TeamId = req.params.id;
  try {
    const rowsDeleted = await Team.destroy({ where: { id: TeamId } });
    if (rowsDeleted === 0) {
      res.status(404).send('Team data not found');
    } else {
      res.status(200).send('Data deleted successfully');
    }
  } catch (error) {
    console.error('Error deleting data: ' + error.message);
    res.status(500).send('Error deleting data');
  }
};

const ListTeam = async (req, res) => {
  const { search = '', page = 1, pageSize = 5, sortBy = 'createdAt', ...restQueries } = req.query;
  const filters = {};
  for (const key in restQueries) {
    filters[key] = restQueries[key];
  }
  const offset = (parseInt(page) - 1) * parseInt(pageSize);

  // MySQL query to fetch paginated teams
  let sql = `SELECT * FROM Teams WHERE (name LIKE '%${search}%')`;

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

    // Execute the count query to get the total number of teams
    let sqlCount = `SELECT COUNT(*) as total FROM Teams WHERE (name LIKE '%${search}%')`;

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

      const totalTeams = countResult[0].total;
      const totalPages = Math.ceil(totalTeams / pageSize);

      res.json({
        Teams: result,
        totalPages: parseInt(totalPages),
        currentPage: parseInt(page),
        pageSize: parseInt(pageSize),
        totalTeams: parseInt(totalTeams),
        startTeam: parseInt(offset) + 1, // Correct the start team index
        endTeam: parseInt(offset) + parseInt(pageSize), // Correct the end team index
        search
      });
    });
  });
};

const List_Team_Pub = async (req, res) => {
  const { search = '', page = 1, pageSize = 5, sortBy = 'createdAt', ...restQueries } = req.query;
  const filters = {};
  for (const key in restQueries) {
    filters[key] = restQueries[key];

  }
  const offset = (parseInt(page) - 1) * (parseInt(pageSize));

  // MySQL query to fetch paginated users

  let sql = `SELECT * FROM Teams WHERE (name LIKE '%${search}%')`;

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

    let sqlCount = `SELECT COUNT(*) as total FROM Teams WHERE (name LIKE '%${search}%')`;

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

      res.json({

        Teams: result,

        totalPages: parseInt(totalPages),

        currentPage: parseInt(page),

        pageSize: parseInt(pageSize),

        totalTeams: parseInt(totalUsers),

        startTeam: parseInt(offset),

        endTeam: parseInt(offset + pageSize),

        search

      });

    });

  });

};
const getTeamDataById = (req, res) => {
  const entityId = req.params.id;
  mycon.query('SELECT * FROM Teams WHERE id = ?', entityId, (err, result) => {
    if (err) {
      console.error('Error retrieving data: ' + err.stack);
      res.status(500).send('Error retrieving data');
      return;
    }

    if (result.length === 0) {
      res.status(404).send('Teams data not found');
      return;
    }

    res.status(200).json(result[0]);
  });
};

module.exports = { CreateTeam, getTeamDataById, ListTeam, DeleteTeamById, UpdateTeam, List_Team_Pub };
