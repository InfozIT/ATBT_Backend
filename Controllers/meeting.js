var db = require('../models/index');
const Meet = db.Meeting;
const mycon = require('../DB/mycon');
const Team = db.Team
const Entity = db.Entity


const CreateMeeting = async (req, res) => {
  try {
    let file = req.file;
    let data = req.body;
    let Query = req.query;

    // Extracting entityId and teamId from query parameters
    const entityId = Query?.entity ?? null;
    const teamId = Query?.team ?? null;
    const userId = Query?.user ?? null;

    // Modify data if file is present
    if (file) {
      data = {
        image: `${process.env.IMAGE_URI}/images/${req.file.filename}`,
        ...data,
      };
    }

    // Inserting data into the Meetings table
    const insertQuery = 'INSERT INTO Meetings SET ?';
    const result = await new Promise((resolve, reject) => {
      mycon.query(insertQuery, data, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
    const createdMeeting = await db.Meeting.findOne({ where: { id: result.insertId } });
    if (createdMeeting) {
      if (entityId) {
        const entity = await Entity.findOne({ where: { id: entityId } });
        await createdMeeting.setEntity(entity);
      } else if (userId) {
        const user = await db.User.findOne({ where: { id: userId } });
        await createdMeeting.setUser(user);
      }
      else if (teamId) {
        const team = await Team.findOne({ where: { id: teamId } });
        await createdMeeting.setTeam(team);
      }
    }

    res.status(201).send(`${result.insertId}`);
  } catch (error) {
    console.error("Error creating Meeting:", error);
    res.status(500).send("Error creating meeting");
  }
};


const ListMeetings = async (req, res) => {
  const { search = '', page = 1, pageSize = 5, sortBy = 'createdAt', ...restQueries } = req.query;
  const filters = {};
  for (const key in restQueries) {
    filters[key] = restQueries[key];
  }
  const offset = (parseInt(page) - 1) * parseInt(pageSize);

  // MySQL query to fetch paginated meetings
  let sql = `SELECT * FROM Meetings WHERE (meetingnumber LIKE '%${search}%')`;

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

    // Execute the count query to get the total number of meetings
    let sqlCount = `SELECT COUNT(*) as total FROM Meetings WHERE (meetingnumber LIKE '%${search}%')`;

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

      const totalMeetings = countResult[0].total;
      const totalPages = Math.ceil(totalMeetings / pageSize);

      res.json({
        Meetings: result,
        totalPages: parseInt(totalPages),
        currentPage: parseInt(page),
        pageSize: parseInt(pageSize),
        totalMeetings: parseInt(totalMeetings),
        startMeeting: parseInt(offset) + 1, // Correct the start meeting index
        endMeeting: parseInt(offset) + parseInt(pageSize), // Correct the end meeting index
        search
      });
    });
  });
};

const ListMeetingsPub = async (req, res) => {
  const { search = '', page = 1, pageSize = 5, sortBy = 'createdAt', ...restQueries } = req.query;
  const filters = {};
  for (const key in restQueries) {
    filters[key] = restQueries[key];

  }
  const offset = (parseInt(page) - 1) * (parseInt(pageSize));

  // MySQL query to fetch paginated users

  let sql = `SELECT * FROM Meetings WHERE (meetingnumber LIKE '%${search}%')`;

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

    let sqlCount = `SELECT COUNT(*) as total FROM Meetings WHERE (meetingnumber LIKE '%${search}%')`;

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

        Meetings: result,

        totalPages: parseInt(totalPages),

        currentPage: parseInt(page),

        pageSize: parseInt(pageSize),

        totalMeetings: parseInt(totalUsers),

        startMeeting: parseInt(offset),

        endMeeting: parseInt(offset + pageSize),

        search

      });

    });

  });

};

const GetMeeting = (req, res) => {
  const entityId = req.query.EntityId;
  const userId = req.query.UserId;

  mycon.query('SELECT * FROM Meetings WHERE EntityId = ?', entityId, (err, result) => {
    if (err) {
      console.error('Error retrieving data: ' + err.stack);
      res.status(500).send('Error retrieving data');
      return;
    }

    if (result.length === 0) {
      res.status(404).send('Entity data not found');
      return;
    }

    res.status(200).json(result);
  });
};

const UpdateMeetings = async (req, res) => {
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

    // Define the SQL query to update the user
    const updateQuery = `UPDATE Meetings SET ? WHERE id = ?`;

    // Execute the update query
    mycon.query(updateQuery, [data, id], (error, updateResults) => {
      if (error) {
        console.error("Error updating User:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.status(201).send(`${id}`);
    });
  } catch (error) {
    console.error("Error updating User:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const DeleteMeeting = async (req, res) => {
  try {
    await Meet.destroy({
      where: { id: req.params.id },
      // truncate: true
    });

    res.status(200).json({ message: `deleted successfully ${req.params.id}` });
  } catch (error) {
    console.error("Error deleting:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};;

module.exports = {
  CreateMeeting,
  ListMeetings,
  GetMeeting,
  UpdateMeetings,
  DeleteMeeting,
  ListMeetingsPub
};
