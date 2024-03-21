var db = require('../models/index');
const Meet = db.Meeting;
const mycon = require('../DB/mycon')


const CreateMeeting = async (req, res) => {
  try {
    let file = req.file;
    let data = req.body;
    const membersId = [4]
    const members = await db.User.findAll({
      where: {
        id: membersId
      }
    });
    console.log(members, "members")
    if (file) {
      data = {
        image: `${process.env.IMAGE_URI}/images/${req.file.filename}`,
        ...data,
      }
    }
    console.log(data)
    mycon.query('INSERT INTO Meetings SET ?', data, async (err, result) => {
      if (err) {
        console.error('Error inserting data: ' + err.stack);
        return res.status(500).send('Error inserting data');
      }
      const createdMeeting = await db.Meeting.findOne({ where: { id: result.insertId } });
      if (createdMeeting && members) {
        await createdMeeting.addUsers(members);
      }
      console.log(createdMeeting, "createdMeeting")
      res.status(201).send(`${result.insertId}`);

    });
  } catch (error) {
    console.error("Error creating Entity:", error);
    res.status(500).send("Error creating user");
  }
};

const ListMeetings = async (req, res) => {
  const { search = '', page = 1, pageSize = 5, sortBy = 'createdAt', ...restQueries } = req.query;
  const filters = {};
  for (const key in restQueries) {
    filters[key] = restQueries[key];

  }
  const offset = (parseInt(page) - 1) * (parseInt(pageSize));

  // MySQL query to fetch paginated users

  let sql = `SELECT * FROM Meetings WHERE (name LIKE '%${search}%')`;

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

    let sqlCount = `SELECT COUNT(*) as total FROM Meetings WHERE (name LIKE '%${search}%')`;

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

        totalPages: totalPages,

        currentPage: page,

        pageSize: pageSize,

        totalMeetings: totalUsers,

        startMeetings: offset,

        endUser: offset + pageSize,

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

  let sql = `SELECT * FROM Meetings WHERE (name LIKE '%${search}%')`;

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

    let sqlCount = `SELECT COUNT(*) as total FROM Meetings WHERE (name LIKE '%${search}%')`;

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

        totalPages: totalPages,

        currentPage: page,

        pageSize: pageSize,

        totalMeetings: totalUsers,

        startMeetings: offset,

        endUser: offset + pageSize,

        search

      });

    });

  });

};


const GetMeeting = (req, res) => {
  const entityId = req.params.id;
  mycon.query('SELECT * FROM Meetings WHERE id = ?', entityId, (err, result) => {
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
