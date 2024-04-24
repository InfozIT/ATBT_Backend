var db = require('../models/index');
const Meet = db.Meeting;
const mycon = require('../DB/mycon');
const transporter = require('../utils/nodemailer')
const { Op } = require('sequelize');





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
      var data = req.body;
      let bmId = req.params.id;
      console.log(bmId);
      
      const task = await db.Task.create({ meetingId: bmId },data);
      res.status(201).send(task);
  } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).send("Error creating task");
  }
};

async function sendEmail(email, password) {

  const mailData = {
      from: 'nirajkr00024@gmail.com',
      to: email,
      subject: 'Welcome to ATBT! Your Account has been Created',
      html: `
          <style>
              /* Add CSS styles here */
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  font-family: Arial, sans-serif;
                  background-color: #f9f9f9;
              }
              .logo {
                  max-width: 100px;
                  margin-bottom: 20px;
              }
              .button {
                  display: inline-block;
                  padding: 10px 20px;
                  background-color: #007bff;
                  color: #fff;
                  text-decoration: none;
                  border-radius: 5px;
              }
              .button:hover {
                  background-color: #0056b3;
              }
              p {
                  margin-bottom: 15px;
              }
          </style>
          <div class="container">
              <img src="https://atbtmain.teksacademy.com/images/logo.png" alt="Your Company Logo" class="logo" />
              <p>Hi there,</p>
              <p>Welcome to ATBT! Your account has been successfully created.</p>
              <p>Here are your account details:</p>
              <ul style="list-style: none;">
                  <li><strong>Email:</strong> ${email}</li>
                  <li><strong>Password:</strong> ${password}</li>
                  <li>
                  <a href="https://www.betaatbt.infozit.com/" class="button" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Login</a>
                  </li>
                  <!-- You can add more user details here if needed -->
              </ul>
              <p>Feel free to explore our platform and start enjoying our services.</p>
              <p>If you have any questions or need assistance, don't hesitate to contact us.</p>
              <p>Thank you for choosing YourCompany!</p>
              <p>Best regards,</p>
              <p>Your Company Team</p>
          </div>
      `,
  };

  await transporter.sendMail(mailData);
}

const ListTask = async (req, res) => {    res.status(201).json({ message: "successfully" });};

const List_Task_Pub = async (req, res) => {    res.status(201).json({ message: "successfully" });};

const GetTask = async (req, res) => {
  const bmId = req.params.id;
  const tasks = await db.Task.findAll({
    where: { meetingId: bmId },
    order: [['createdAt', 'DESC']] 
  });

  res.status(200).json(tasks);
};


  const GetTaskbyId = async (req, res) => {
    const bmId = req.params.id;
    try {
        const tasks = await db.Task.findAll({
            where: { id: bmId },
        });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};


const UpdateTask = async (req, res) => {
    try {
      const taskId = req.params.id; // Assuming taskId is part of the URL
      const updateData = req.body; 
      let {members } = req.body
      let file = req.file;
      const selectedmember = JSON.stringify(members);

      if (file) {
        updateData = {
          members : selectedmember,
          image: `${process.env.IMAGE_URI}/images/${req.file.filename}`,
          ...data,
        }
      }
      const updatedTask = await db.Task.update(updateData, {
        where: { id: req.params.id }
      });
      res.status(200).json({ message: "successfully updated" })
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).send("Error updating task");
    }
  };

  async function sendEmail(email, password) {

    const mailData = {
        from: 'nirajkr00024@gmail.com',
        to: email,
        subject: 'Welcome to ATBT! Your Account has been Created',
        html: `
            <style>
                /* Add CSS styles here */
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: Arial, sans-serif;
                    background-color: #f9f9f9;
                }
                .logo {
                    max-width: 100px;
                    margin-bottom: 20px;
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #007bff;
                    color: #fff;
                    text-decoration: none;
                    border-radius: 5px;
                }
                .button:hover {
                    background-color: #0056b3;
                }
                p {
                    margin-bottom: 15px;
                }
            </style>
            <div class="container">
                <img src="https://atbtmain.teksacademy.com/images/logo.png" alt="Your Company Logo" class="logo" />
                <p>Hi there,</p>
                <p>Welcome to ATBT! Your account has been successfully created.</p>
                <p>Here are your account details:</p>
                <ul style="list-style: none;">
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Password:</strong> ${password}</li>
                    <li>
                    <a href="https://www.betaatbt.infozit.com/" class="button" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Login</a>
                    </li>
                    <!-- You can add more user details here if needed -->
                </ul>
                <p>Feel free to explore our platform and start enjoying our services.</p>
                <p>If you have any questions or need assistance, don't hesitate to contact us.</p>
                <p>Thank you for choosing YourCompany!</p>
                <p>Best regards,</p>
                <p>Your Company Team</p>
            </div>
        `,
    };

    await transporter.sendMail(mailData);
}

const DeleteTask = async (req, res) => {
  try {
    await db.Task.destroy({
      where: { id: req.params.id },
      // truncate: true
    });

    res.status(200).json({ message: `deleted successfully ${req.params.id}` });
  } catch (error) {
    console.error("Error deleting:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



// Get all task by Entiy,team,User

// const GetAllTask = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page, 10) || 1;
//     const pageSize = parseInt(req.query.pageSize, 10) || 10;
//     const sortBy = req.query.sortBy || 'createdAt'; // Default sorting by createdAt if not provided
//     const searchQuery = req.query.search || '';
//     const entityId = req.query.entity;
//     const teamId = req.query.team;
//     const userId = req.query.user;
//     var search = ""  // need to add code 

//     console.log("Extracting",entityId, teamId, userId, "from query parameters")

//     const options = {
//       offset: (page - 1) * pageSize,
//       limit: pageSize,
//       order: sortBy === 'id' ? [['id']] : [[sortBy]],
//       where: {
//         [Op.or]: [
//           { id: { [Op.like]: `%${searchQuery}%` } },
//           // Add more conditions based on your model's attributes
//         ],
//       },
//     };
//     if (searchQuery) {
//       options.where = {
//         [Op.or]: [
//           { id: { [Op.like]: `%${searchQuery}%` } },
//         ],
//       };
//     }
//     if (entityId) {
//       console.log(entityId, "entityId it is from params")
//       var Meet = await db.Meeting.findAll({
//         where: {
//           EntityId: entityId
//       }});
//       const ids = Meet.map(meeting => meeting.dataValues.id);
//       console.log(ids , "borad meeting ids from meeting table")
//       const task = await db.Task.findAll({
//         where: {
//           meetingId: ids // Filter users based on userIds array
//         },
//         raw: true // Get raw data instead of Sequelize model instances
//       });
//       console.log(task)
//     }

//     if (teamId) {
//       options.where.TeamId = teamId;
//     }
//     if (userId) {
//       options.where.UserId = userId;
//     }

//     const { count, rows: Entities } = await db.m.findAndCountAll(options);

//     // Calculate the range of entities being displayed
//     const startEntity = (page - 1) * pageSize + 1;
//     const endEntity = Math.min(page * pageSize, count);

//     const totalPages = Math.ceil(count / pageSize);

//     res.status(200).json({
//       Meetings: Meet,
//       totalMeetings: count,
//       totalPages: totalPages,
//       currentPage: page,
//       pageSize : pageSize,
//       startMeeting:startEntity,
//       endMeeting: endEntity,
//       search
//     });
//   } catch (error) {
//     console.error("Error fetching Entities:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };'




const GetAllTask = async (req, res) => {
  const { userId } = req.user;

  const { search = '', page = 1, pageSize = 5, sortBy = 'id DESC', ...restQueries } = req.query;

  const filters = {};

  for (const key in restQueries) {
      filters[key] = restQueries[key];
  }

  const offset = (parseInt(page) - 1) * parseInt(pageSize);

  const accessdata = await db.UserAccess.findOne({ where: { user_id: userId } });
  const Data = await db.User.findOne({ where: { id: userId } });
  let EntityId =Data.EntityId

  console.log(accessdata?.user_id ?? null, accessdata?.entity_id ?? null, accessdata?.selected_users ?? null, "accessdata", accessdata)

  // MySQL query to fetch paginated entities
  let sql;

  if (!!accessdata && !accessdata.selected_users && !accessdata.entity_id) {
    console.log("hello _ 1")
      sql = `SELECT * FROM Entities WHERE (name LIKE '%${search}%')`
  } else if (!!accessdata && !accessdata.selected_users && accessdata.entity_id) {
    console.log("hello _ 2")
      let entityIds = [...JSON.parse(accessdata.entity_id), EntityId]
      console.log(entityIds, typeof (entityIds), "entityIds")
      sql = `SELECT * FROM Entities WHERE (name LIKE '%${search}%') AND id IN (${entityIds.join(',')})`;
    } 
    else if (!!accessdata && accessdata.selected_users && !accessdata.entity_id) {
      console.log("hello _ 3", accessdata.selected_users)
      //get array of user entity ids
      // userEntityIds = [56]
      const users = await db.User.findAll({
        attributes: ['EntityId'], // Only fetch the entityId column
        where: {
          id: [...JSON.parse(accessdata.selected_users)] // Filter users based on userIds array
        },
        raw: true // Get raw data instead of Sequelize model instances
      });
      const entityIds = users.map(user => user.EntityId);
      console.log(entityIds,"ndcnwocbowbcowboubwou beowubobwobwow")
      sql = `SELECT * FROM Entities WHERE (name LIKE '%${search}%') AND id IN (${entityIds.join(',')})`;
      // sql = `SELECT * FROM Entities WHERE (name LIKE '%${search}%')`
  } 
  else if (!accessdata) {
    console.log("hello _ 4")
      sql = `SELECT * FROM Entities WHERE (name LIKE '%${search}%') AND id = '${EntityId}'`;
  }

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

      // Execute the count query to get the total number of entities
      let sqlCount;
      if (!!accessdata && !accessdata.selected_users && !accessdata.entity_id) {
        console.log("first _ 1")
          sqlCount = `SELECT COUNT(*) as total FROM Entities WHERE (name LIKE '%${search}%')`;
      } else if (!!accessdata && !accessdata.selected_users && accessdata.entity_id) {
        console.log("first _ 2")
          let entityIds = [...JSON.parse(accessdata.entity_id), EntityId]
          console.log(entityIds, "entityIds")
          sqlCount = `SELECT COUNT(*) as total FROM Entities WHERE (name LIKE '%${search}%') AND id IN (${entityIds.join(',')})`;
      } 
      else if (!!accessdata && accessdata.selected_users && !accessdata.entity_id) {
        console.log("first _ 3")
        //get array of user entity ids
        userEntityIds = [81]
        sqlCount = `SELECT COUNT(*) as total FROM Entities WHERE (name LIKE '%${search}%') AND id IN (${userEntityIds.join(',')})`;
        // sqlCount = `SELECT COUNT(*) as total FROM Entities WHERE (name LIKE '%${search}%')`
    }
       else if (!accessdata) {
        console.log("first _ 4")
          sqlCount = `SELECT COUNT(*) as total FROM Users WHERE (name LIKE '%${search}%') AND id = '${EntityId}'`;
      }

      // Add conditions for additional filter fields
      for (const [field, value] of Object.entries(filters)) {
          if (value !== '') {
              sqlCount += ` AND ${field} LIKE '%${value}%'`;
          }
      }

      mycon.query(sqlCount, async (err, countResult) => {
          if (err) {
              console.error('Error executing MySQL count query: ' + err.stack);
              res.status(500).json({ error: 'Internal server error' });
              return;
          }

          const totalEntities = countResult[0].total;
          const totalPages = Math.ceil(totalEntities / pageSize);

          res.json({
              Entities: result,
              totalPages: parseInt(totalPages),
              currentPage: parseInt(page),
              pageSize: parseInt(pageSize),
              totalEntities: parseInt(totalEntities),
              startEntity: parseInt(offset) + 1, // Correct the start entity index
              endEntity: parseInt(offset) + parseInt(pageSize), // Correct the end entity index
              search
          });
      });
  });
};


module.exports = {
  CreateTask,
  ListTask,
  GetTask,
  UpdateTask,
  DeleteTask,
  List_Task_Pub,
  ListEntiyGroup,
  ListTeamGroup,
  GetTaskbyId,
  GetAllTask
};



