var db = require('../models/index');
const Meet = db.Meeting;
const mycon = require('../DB/mycon');
const Team = db.Team
const Entity = db.Entity
const { Op } = require('sequelize');
const uploadToS3 = require('../utils/wearhouse')



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
      const result = await uploadToS3(req.file);
      data = {
        image: `${result.Location}`,
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

// const GetMeeting = async (req, res) => {

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
//       order: sortBy === 'meetingnumber' ? [['meetingnumber']] : sortBy === 'description' ? [['description']] : [[sortBy]],
//       where: {
//         [Op.or]: [
//           { meetingnumber: { [Op.like]: `%${searchQuery}%` } },
//           { description: { [Op.like]: `%${searchQuery}%` } },
//           // Add more conditions based on your model's attributes
//         ],
//       },
//     };
//     if (searchQuery) {
//       options.where = {
//         [Op.or]: [
//           { meetingnumber: { [Op.like]: `%${searchQuery}%` } },
//           { description: { [Op.like]: `%${searchQuery}%` } },
//         ],
//       };
//     }
//     if (entityId) {
//       options.where.EntityId = entityId;
//     }
//     if (teamId) {
//       options.where.TeamId = teamId;
//     }
//     if (userId) {
//       options.where.UserId = userId;
//     }

//     const { count, rows: Entities } = await db.Meeting.findAndCountAll(options);

//     // Calculate the range of entities being displayed
//     const startEntity = (page - 1) * pageSize + 1;
//     const endEntity = Math.min(page * pageSize, count);

//     const totalPages = Math.ceil(count / pageSize);

//     res.status(200).json({
//       Meetings: Entities,
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
// };

const GetMeeting = async (req, res) => {

  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const sortBy = req.query.sortBy || 'createdAt'; // Default sorting by createdAt if not provided
    const searchQuery = req.query.search || '';
    const entityId = req.query.entity;
    const teamId = req.query.team;
    const userId = req.query.user;

    console.log("Extracting", entityId, teamId, userId, "from query parameters");

    const options = {
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: sortBy === 'meetingnumber' ? [['meetingnumber']] : sortBy === 'description' ? [['description']] : [[sortBy]],
      where: {
        [Op.or]: [
          { meetingnumber: { [Op.like]: `%${searchQuery}%` } },
          { description: { [Op.like]: `%${searchQuery}%` } },
          // Add more conditions based on your model's attributes
        ],
      },
    };

    // Modify the search condition based on meetingnumber
    if (searchQuery) {
      const meetingNumberSearch = { meetingnumber: { [Op.like]: `%${searchQuery}%` } };
      options.where = {
        [Op.and]: [
          options.where,
          { [Op.or]: [meetingNumberSearch, { description: { [Op.like]: `%${searchQuery}%` } }] }
        ]
      };
    }

    if (entityId) {
      options.where.EntityId = entityId;
    }
    if (teamId) {
      options.where.TeamId = teamId;
    }
    if (userId) {
      options.where.UserId = userId;
    }

    const { count, rows: Meetings } = await db.Meeting.findAndCountAll(options);

    // Calculate the range of meetings being displayed
    const startMeeting = (page - 1) * pageSize + 1;
    const endMeeting = Math.min(page * pageSize, count);

    const totalPages = Math.ceil(count / pageSize);

    res.status(200).json({
      Meetings: Meetings,
      totalMeetings: count,
      totalPages: totalPages,
      currentPage: page,
      pageSize: pageSize,
      startMeeting: startMeeting,
      endMeeting: endMeeting,
      search: searchQuery
    });
  } catch (error) {
    console.error("Error fetching Meetings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const UpdateMeetings = async (req, res) => {
  try {
    const { id } = req.params;
    let data = req.body;
    let file = req.file;
    if (file) {
      const result = await uploadToS3(req.file);
      data = {
        image: `${result.Location}`,
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
};

const ListEntiyGroup = async (req, res) => { 
  const bmId = req.params.id;
  
  try {
    // Find the meeting details by ID
    const meetData = await Meet.findOne({ where: { id: bmId } });
    if (!meetData) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    const entityId = meetData.EntityId;

    // Find all meeting members' IDs
    const meetingMembers = await db.Meeting.findOne({
      attributes: ['members'],
      where: { id: bmId },
      raw: true
    });

    if (!meetingMembers || !meetingMembers.members) {
      return res.status(404).json({ error: 'No members found for the meeting' });
    }

    const extractedIds = meetingMembers.members.map(member => member.id);

    // Fetch user details based on extracted IDs
    const users = await db.User.findAll({
      attributes: ['id', 'image', 'name', 'email', 'EntityId'],
      where: { id: { [Op.in]: extractedIds } }
    });

    // Include the meeting data user if it's not already in the users list
    var meetingData = await db.User.findAll({
      attributes: ['id', 'image', 'name', 'email', 'EntityId'],
      where: { EntityId: entityId }
    });
    
    let combinedUsers = [...meetingData,...users]
   
    let uniqueUsers = new Map();
    combinedUsers.forEach(user => {
      uniqueUsers.set(user.id, user);
    });

    // Convert map values (unique user objects) back to an array
    combinedUsers = Array.from(uniqueUsers.values());


    res.status(200).json(combinedUsers); // Send users as JSON response  
  } catch (error) {
    console.error('Error: ' + error);
    res.status(500).send('Error processing request');
  }
};

const ListUserGroup = async (req, res) => {
  try {
    var users = await db.Meeting.findAll({
      attributes: ['members','UserId'],
      where: {
        id: req.params.id
      },
      raw: true
    });
    const extractedIds = users.flatMap(entry => entry.members.map(member => member.id));
    const userId = users.map(item => parseInt(item.UserId))
    const uniqIds = [...new Set(extractedIds)];
    const members = await db.User.findAll({
      attributes: ['id', 'image', 'name','email','EntityId'],
      where: {
        id: { [Op.in]: uniqIds }
      },
    });
    const self = await db.User.findAll({
      attributes: ['id', 'image', 'name','email','EntityId'],
      where: {
        id: { [Op.in]: userId }
      },
    });
    
    let combinedUsers = [...self, ...members];

    let uniqueUsers = new Map();
    combinedUsers.forEach(user => {
      uniqueUsers.set(user.id, user);
    });

    // Convert map values (unique user objects) back to an array
    combinedUsers = Array.from(uniqueUsers.values());


    res.status(200).json(combinedUsers); // Send users as JSON response      
  

  } catch (error) {
    console.error('Error: ' + error);
    res.status(500).send('Error processing request');
  }
};
const ListTeamGroup = async (req, res) => {
  try {
    let users = await db.Meeting.findAll({
      attributes: ['members','TeamId'],
      where: {
        id: req.params.id
      },
      raw: true
    });
    const extractedIds = users.flatMap(entry => entry.members.map(member => member.id));
    let TeamId = users.map(item => parseInt(item.TeamId))

    const membersForMeeting = await db.User.findAll({
      attributes: ['id', 'image', 'name','email','EntityId'],
      where: {
        id: { [Op.in]: extractedIds }
      },
    });
    const TeamMemberid = await db.Team.findAll({
      attributes: ['members'],
      where: {
        id: TeamId }
    });
    const membersForTeam = await db.User.findAll({
      attributes: ['id', 'image', 'name','email','EntityId'],
      where: {
        id: { [Op.in]: TeamMemberid }
      },
    });
    
    let combinedUsers = [...membersForTeam, ...membersForMeeting];

    let uniqueUsers = new Map();
    combinedUsers.forEach(user => {
      uniqueUsers.set(user.id, user);
    });

    // Convert map values (unique user objects) back to an array
    combinedUsers = Array.from(uniqueUsers.values());


    res.status(200).json(combinedUsers); // Send users as JSON response      
  

  } catch (error) {
    console.error('Error: ' + error);
    res.status(500).send('Error processing request');
  }
};

const GetById = async (req, res) => {
  try {
    const meetings = await Meet.findOne({
      where: { id: req.params.id },
      // truncate: true
    });

    res.status(200).json(meetings);
  } catch (error) {
    console.error("Error deleting:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


module.exports = {
  CreateMeeting,
  ListMeetings,
  GetMeeting,
  UpdateMeetings,
  DeleteMeeting,
  ListEntiyGroup,
  ListTeamGroup,
  ListUserGroup,
  GetById
};
