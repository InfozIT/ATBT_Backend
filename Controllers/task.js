var db = require('../models/index');
const Meet = db.Meeting;
const mycon = require('../DB/mycon');


// const ListEntiyGroup = async (req, res) => {
//   const bmId = req.params.id;
//   const ids = [];

//   try {
//     const Data = await Meet.findOne({ where: { id: bmId } });
//     const result = await Meet.findAll({
//       where: {
//         id: bmId
//       },
//       attributes: ['members'] // Specify the column you want to retrieve
//     });

//     let members = result.map(meeting => meeting.dataValues.members).flat();
//     ids.push(...members); // Spread the members array to push individual elements

//     let EntID = Data.EntityId;

//     mycon.query('SELECT * FROM Users WHERE EntityId = ?', EntID, async (err, result1) => {
//       if (err) {
//         console.error('Error retrieving data: ' + err.stack);
//         res.status(500).send('Error retrieving data');
//         return;
//       }
//       ids.push(...result1); // Spread the user IDs array to push individual elements

//       // Removing duplicates from ids array
//       const uniqIds = [...new Set(ids)];
//       const ID = uniqIds.ids.map(obj => obj.id);
//       console.log(ID)

//       await Meet.update({ members: uniqIds }, {
//         where: {
//           id: bmId
//         }
//       });

//       res.status(200).json({ ids: uniqIds }); // Sending unique ids array in the response
//     });
//   } catch (error) {
//     console.error('Error: ' + error);
//     res.status(500).send('Error processing request');
//   }
// };


const ListEntiyGroup = async (req, res) => { // Changed function name to follow camelCase convention
  const bmId = req.params.id;
  const ids = [];

  try {
    const meetdata = await Meet.findOne({ where: { id: bmId } });
    ids.push(...meetdata.members)
    let EntID = (meetdata.EntityId)
    
    mycon.query('SELECT * FROM Users WHERE EntityId = ?', EntID, async (err, result1) => { // Passed EntID as an array
      if (err) {
        console.error('Error retrieving data: ' + err.stack);
        res.status(500).send('Error retrieving data');
        return;
      }
      // Extracting user IDs from result1 array
      console.log(result1)
      ids.push(...result1); // Spread the user IDs array to push individual elements

      // Removing duplicates from ids array
      const uniqIds = [...new Set(ids)];


      res.status(200).json({ ids: uniqIds }); // Sending unique ids array in the response


    });
  } catch (error) {
    console.error('Error: ' + error);
    res.status(500).send('Error processing request');
  }
};


// const ListTeamGroup = async (req, res) =>  {
//   const bmId = req.params.id;
//   const ids = [];
//   mycon.query('SELECT members,TeamId FROM Meetings WHERE id = ?', bmId, (err, result) => {
//     if (err) {
//       console.error('Error retrieving data: ' + err.stack);
//       res.status(500).send('Error retrieving data');
//       return;
//     }
//     if (result.length === 0) {
//       res.status(404).send('Entity data not found');
//       return;
//     }
//     var EntID = (result[0].TeamId);
//     // Iterate over each member and push their id into ids array
//     for (let i = 0; i < result[0].members.length; i++) {
//       ids.push(result[0].members[i].id);
//     }
//     mycon.query('SELECT * FROM UserTeam WHERE TeamId = ?', EntID, (err, result1) => {
//       if (err) {
//         console.error('Error retrieving data: ' + err.stack);
//         res.status(500).send('Error retrieving data');
//         return;
//       }
//       if (result1.length === 0) {
//         res.status(404).send('Entity data not found');
//         return;
//       }
//       for (let i = 0; i < result1.length; i++) {
//         ids.push(result1[i].UserId);
//       }
//       const uniq = [...new Set(ids)];
//       res.status(200).json({ ids: uniqids }); // Sending ids array in the response
//     });
//   });
// };

const ListTeamGroup = async (req, res) =>  {
  const bmId = req.params.id;
  const ids = [];
  mycon.query('SELECT members,TeamId FROM Meetings WHERE id = ?', bmId, (err, result) => {
    if (err) {
      console.error('Error retrieving data: ' + err.stack);
      res.status(500).send('Error retrieving data');
      return;
    }
    if (result.length === 0) {
      res.status(404).send('Entity data not found');
      return;
    }
    var EntID = (result[0].TeamId);
    // Iterate over each member and push their id into ids array
    for (let i = 0; i < result[0].members.length; i++) {
      ids.push(result[0].members[i].id);
    }
    mycon.query('SELECT * FROM UserTeam WHERE TeamId = ?', EntID, (err, result1) => {
      if (err) {
        console.error('Error retrieving data: ' + err.stack);
        res.status(500).send('Error retrieving data');
        return;
      }
      if (result1.length === 0) {
        res.status(404).send('Entity data not found');
        return;
      }
      for (let i = 0; i < result1.length; i++) {
        ids.push(result1[i].UserId);
      }
      // Filter out null values from the ids array
      const filteredIds = ids.filter(id => id !== null);
      const uniq = [...new Set(filteredIds)];
      res.status(200).json({ ids: uniq }); // Sending ids array in the response
    });
  });
};

// CRUD for task module

const CreateTask = async (req, res) => {
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
    console.log(req.body, "body")
    const existingEntity = await db.Task.findOne({ where: { name } });
    console.log(name, existingEntity, "existin entity")
    if (existingEntity) {
      console.error("entity already exists.");
      return res.status(400).send("entity already exists");
    }
    console.log(data, file, "create data and file")
    if (file) {
      data = {
        image: `${process.env.IMAGE_URI}/images/${req.file.filename}`,
        ...data,
      }
    }
    console.log(data)
    mycon.query('INSERT INTO Entities SET ?', data, async (err, result) => {
      if (err) {
        console.error('Error inserting data: ' + err.stack);
        return res.status(500).send('Error inserting data');
      }
      const createdEntity = await db.Entity.findOne({ where: { id: result.insertId } });
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
const ListTask = async (req, res) => {
  const { search = '', page = 1, pageSize = 5, sortBy = 'createdAt', ...restQueries } = req.query;
  const filters = {};
  for (const key in restQueries) {
      filters[key] = restQueries[key];
  }
  const offset = (parseInt(page) - 1) * parseInt(pageSize);

  // MySQL query to fetch paginated users
  let sql = `SELECT * FROM Users WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%')`;

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

      // Execute the count query to get the total number of users
      let sqlCount = `SELECT COUNT(*) as total FROM Users WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%')`;

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
              users: result,
              totalPages: parseInt(totalPages),
              currentPage: parseInt(page),
              pageSize: parseInt(pageSize),
              totalUsers: parseInt(totalUsers),
              startUser: parseInt(offset) + 1, // Correct the start user index
              endUser: parseInt(offset) + parseInt(pageSize), // Correct the end user index
              search
          });
      });
  });
};
const List_Task_Pub = async (req, res) => {
  const { search = '', page = 1, pageSize = 5, sortBy = 'createdAt', ...restQueries } = req.query;
  const filters = {};
  for (const key in restQueries) {
      filters[key] = restQueries[key];

  }
  const offset = (parseInt(page) - 1) * (parseInt(pageSize));

  // MySQL query to fetch paginated users

  let sql = `SELECT * FROM Users WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%')`;

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

      let sqlCount = `SELECT COUNT(*) as total FROM Users WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%')`;

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

          const final = result.map(item => { return { name: item.name, id: item.id, email: item.email, image: item.image } });


          res.json({

              users: final,

              totalPages: parseInt(totalPages),

              currentPage: parseInt(page),

              pageSize: parseInt(pageSize),

              totalUsers: parseInt(totalUsers),

              startUser: parseInt(offset),

              endUser: parseInt(offset + pageSize),

              search

          });

      });

  });

};
const GetTask = async (req, res) => {
  try {
      // Execute the query using the promise wrapper
      const [rows] = await mycon.promise().query('SELECT * FROM Tasks WHERE id = ?', [req.params.id]);

      if (!rows.length) {
          return res.status(404).json({ error: 'Task not found' });
      }

      // Parse "userremarkshistory" property to JSON
      const task = rows[0];
      res.status(200).json({ message: `Your id is: ${req.params.id}`, task });
  } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};

const UpdateTask = async (req, res) => {
  try {
      const { id } = req.params;
      const { role: roleName } = req.body;
      let data = req.body;
      const file = req.file;
      let image;

      // Find role in the database
      const role = await db.Role.findOne({ where: { name: roleName } });
      if (!role) {
          console.error("Role not found.");
          return res.status(404).send("Role not found");
      } else {
          data.RoleId = role.id;
      }

      // Check if file is uploaded
      if (file) {
          image = `${process.env.IMAGE_URI}/images/${req.file.filename}`;
          data.image = image;
      }

      // Define the SQL query to update the user
      const updateQuery = `UPDATE Users SET ? WHERE id = ?`;

      // Execute the update query
      mycon.query(updateQuery, [data, id], (error, updateResults) => {
          if (error) {
              console.error("Error updating User:", error);
              return res.status(500).json({ error: "Internal Server Error" });
          }
          res.status(201).json(`${id}`);
      });
  } catch (error) {
      console.error("Error updating User:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
};

const DeleteTask = async (req, res) => {
  try {
      await Task.destroy({
          where: { id: req.params.id },
          // truncate: true
      });

      res.status(200).json({ message: `Task deleted successfully ${req.params.id}` });
  } catch (error) {
      console.error("Error deleting User:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
};




module.exports = {
  CreateTask,
  ListTask,
  GetTask,
  UpdateTask,
  DeleteTask,
  List_Task_Pub,
  ListEntiyGroup,
  ListTeamGroup
};



