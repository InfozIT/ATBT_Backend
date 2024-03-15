var db = require('../models/index');
const Meet = db.Meeting;
const mycon = require('../DB/mycon')


const CreateMeeting = async (req, res) => {
  try {
    let file = req.file;
    let data = req.body;
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
      res.status(201).send(`${result.insertId}`);

    });
  } catch (error) {
    console.error("Error creating Entity:", error);
    res.status(500).send("Error creating user");
  }
};

const ListMeetings = async (req, res) => {
  const body = req.body
  // Extract query parameters
  const page = parseInt(req.query.page) || 1; // Default page is 1
  const pageSize = parseInt(req.query.pageSize) || 5; // Default page size is 5
  const search = req.query.search || ''; // Default search is empty string

  let filter = req.body.filters || '';

  // Calculate offset
  const offset = (page - 1) * pageSize;

  // MySQL query to fetch paginated users
  let sql = `SELECT * FROM Meetings WHERE (name LIKE '%${search}%')`;

  // Add conditions for additional filter fields
  if (!!filter) {
    for (const [field, value] of Object.entries(filter)) {
      if (value !== '') {
        sql += ` AND ${field} LIKE '%${value}%'`; // Add the condition
      }
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
    if (!!filter) {
      for (const [field, value] of Object.entries(filter)) {
        if (value !== '') {
          sqlCount += ` AND ${field} LIKE '%${value}%'`;
        }
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
        totalmeeting: totalUsers,
        startmeeting: offset,
        endmeeting: offset + pageSize,
        search
      });
    });
  });
};

const ListMeetPub = async (req, res) => {
  const body = req.body
  // Extract query parameters
  const page = parseInt(req.query.page) || 1; // Default page is 1
  const pageSize = parseInt(req.query.pageSize) || 5; // Default page size is 5
  const search = req.query.search || ''; // Default search is empty string

  let filter = req.body.filters || '';

  // Calculate offset
  const offset = (page - 1) * pageSize;

  // MySQL query to fetch paginated users
  let sql = `SELECT * FROM Meetings WHERE (name LIKE '%${search}%')`;

  // Add conditions for additional filter fields
  if (!!filter) {
    for (const [field, value] of Object.entries(filter)) {
      if (value !== '') {
        sql += ` AND ${field} LIKE '%${value}%'`; // Add the condition
      }
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
    if (!!filter) {
      for (const [field, value] of Object.entries(filter)) {
        if (value !== '') {
          sqlCount += ` AND ${field} LIKE '%${value}%'`;
        }
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
        totalmeeting: totalUsers,
        startmeeting: offset,
        endmeeting: offset + pageSize,
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
  ListMeetPub
};
