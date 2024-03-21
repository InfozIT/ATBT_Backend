var db = require('../models/index');
const Team = db.Team;
require('dotenv').config();
var db = require('../models/index');

const mycon = require('../DB/mycon')




const CreateTeam = async (req, res) => {
  try {
    let file = req.file;
    let data = req.body;
    const membersId = [4, 12]
    const members = await db.User.findAll({
      where: {
        id: membersId
      }
    });
    if (file) {
      data = {
        image: `${process.env.IMAGE_URI}/images/${req.file.filename}`,
        ...data,
      }
    }
    mycon.query('INSERT INTO Teams SET ?', data, async (err, result) => {
      if (err) {
        console.error('Error inserting data: ' + err.stack);
        return res.status(500).send('Error inserting data');
      }
      const createdTeam = await db.Team.findOne({ where: { id: result.insertId } });
      if (createdTeam && members) {
        await createdTeam.addUsers(members);
      }
      res.status(201).send(`${result.insertId}`);

    });
  } catch (error) {
    console.error("Error creating Teams:", error);
    res.status(500).send("Error creating Teams");
  }
}

const UpdateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    let data = req.body;
    let file = req.file;
    let image;
    if (file) {
      image = `${process.env.IMAGE_URI}/images/${req.file.filename}`;
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
// const ListTeam = async (req, res) => {
//   const body = req.body
//   // Extract query parameters
//   const page = parseInt(req.query.page) || 1; // Default page is 1
//   const pageSize = parseInt(req.query.pageSize) || 5; // Default page size is 5
//   const search = req.query.search || ''; // Default search is empty string

//   let filter = req.body.filters || '';

//   // Calculate offset
//   const offset = (page - 1) * pageSize;

//   // MySQL query to fetch paginated users
//   let sql = `SELECT * FROM Teams WHERE (name LIKE '%${search}%')`;

//   // Add conditions for additional filter fields
//   if (!!filter) {
//     for (const [field, value] of Object.entries(filter)) {
//       if (value !== '') {
//         sql += ` AND ${field} LIKE '%${value}%'`; // Add the condition
//       }
//     }
//   }

//   mycon.query(sql, [offset, pageSize], (err, result) => {
//     if (err) {
//       console.error('Error executing MySQL query: ' + err.stack);
//       res.status(500).json({ error: 'Internal server error' });
//       return;
//     }

//     // Execute the count query to get the total number of users
//     let sqlCount = `SELECT COUNT(*) as total FROM Teams WHERE (name LIKE '%${search}%')`;

//     // Add conditions for additional filter fields
//     if (!!filter) {
//       for (const [field, value] of Object.entries(filter)) {
//         if (value !== '') {
//           sqlCount += ` AND ${field} LIKE '%${value}%'`;
//         }
//       }
//     }

//     mycon.query(sqlCount, (err, countResult) => {
//       if (err) {
//         console.error('Error executing MySQL count query: ' + err.stack);
//         res.status(500).json({ error: 'Internal server error' });
//         return;
//       }
//       const totalUsers = countResult[0].total;
//       const totalPages = Math.ceil(totalUsers / pageSize);

//       res.json({
//         Teams: result,
//         totalPages: totalPages,
//         currentPage: page,
//         pageSize: pageSize,
//         totalteams: totalUsers,
//         startteam: offset,
//         endteam: offset + pageSize,
//         search
//       });
//     });
//   });
// };

const ListTeam = async (req, res) => {
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

        totalPages: totalPages,

        currentPage: page,

        pageSize: pageSize,

        totalTeams: totalUsers,

        startTeams: offset,

        endTeams: offset + pageSize,

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

        totalPages: totalPages,

        currentPage: page,

        pageSize: pageSize,

        totalTeams: totalUsers,

        startTeams: offset,

        endTeams: offset + pageSize,

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
