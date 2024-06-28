const db = require('../models/index');
const Team = db.Team;
require('dotenv').config();
// const db = require('../models/index');
const {uploadToS3} = require('../utils/wearhouse')
const { QueryTypes } = require('sequelize');
const mycon = require('../DB/mycon')
const { Op } = require('sequelize');

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
      const result = await uploadToS3(req.file);

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
      let insertId =(result.insertId)
      const member = await db.Team.findOne({ where: { id:insertId } });
      Meetmember = (member.dataValues.members)
      createdby = (member.dataValues.createdBy)

      let num1 = Number(createdby);
      let Ceatorname = await db.User.findAll({
        attributes: ['name'],
        where: { id: num1 },
        raw: true,
      });
      let Creatorname = Ceatorname.map(entry => entry.name);
      Meetmember.push(num1)
      let TeamName = (member.dataValues.name)


      let email = await db.User.findAll({
       attributes: ['email','name'],
       where: { id: { [Op.in]: Meetmember } },
       raw: true
     });
   
     let emails = email.map(entry => entry.email);
     let Names = email.map(entry => entry.name);
     console.log(Names)

     for (let i = 0; i < emails.length; i++) {
    const mailData = {
        from: 'nirajkr00024@gmail.com',
        to: emails[i],
        subject: `Welcome to ${TeamName}!`,
        html: `
          <style>
            .container {
              max-width: 700px;
              margin: 0 auto;
              padding: 24px 0;
              font-family: "Poppins", sans-serif;
              background-color: rgb(231 229 228);
              border-radius: 1%;
            }
            .banner {
              margin-bottom: 10px;
              width: 90px;
              height: 8vh;
              margin-right: 20px;
            }
            .header {
              display: flex;
              align-items: center;
              justify-content:center;
              padding-top: 10px;
            }
            p {
              margin-bottom: 15px;
            }
            .container-main {
              max-width: 650px;
              margin: 0 auto;
              font-family: "serif", sans-serif;
              background-color: #fafafa;
              border-radius: 1%;
            }
            .content {
              padding: 25px;
            }
            .footer {
              background-color: rgb(249 115 22);
              padding: 0.5em;
              text-align: center;
            }
          </style>
          <div class="container">
            <div class="container-main">
              <div class="header">
                <img
                  src="https://upload-from-node.s3.ap-south-1.amazonaws.com/b66dcf3d-b7e7-4e5b-85d4-9052a6f6fa39-image+(6).png"
                  alt="kapil_Groups_Logo"
                  class="banner"
                />
              </div>
              <hr style="margin: 0" />
              <div class="content">
                <h5 style="font-size: 1rem; font-weight: 500">
                  Dear <span style="font-weight: bold">${Names[i]}</span>,
                </h5>
                <div style="font-size: 0.8rem">
                  <p style="line-height: 1.4">
                  We're excited to extend an invitation for you to join ${TeamName}. Here are the team members:
                   
                  </p>
                  <p> ${Names.join(', ')}</p>
     
                  <p style="padding-top: 15px;">Warm regards,</p>
                  <p>${Creatorname}</p>
                  <p>Kapil Group</p>
                </div>
              </div>
              <div class="footer">
                <p style="color: white; font-size: 15px; margin: 0">
                  All rights are reserved by Kapil Group
                </p>
              </div>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailData);
    }
    });
  } catch (error) {
    console.error("Error creating Entity:", error);
    res.status(500).send("Error creating user");
  }
};

// const UpdateTeam = async (req, res) => {
//   try {
//     let { id } = req.params;
//     let data = req.body;
//     let file = req.file;
//     let image;

//     // Handle file upload
//     if (file) {
//       const result = await uploadToS3(file);
//       image = `${result.Location}`;
//       data.image = image;
//     }

//     // Define the SQL query to update the Teams
//     const updateQuery = `UPDATE Teams SET ? WHERE id = ?`;

//     // Execute the update query
//     mycon.query(updateQuery, [data, id], (error, updateResults) => {
//       if (error) {
//         console.error("Error updating Teams:", error);
//         return res.status(500).json({ error: "Internal Server Error" });
//       }

//       const member = await db.Team.findOne({ where: { id:insertId } });
//       Meetmember = (member.dataValues.members)
//       createdby = (member.dataValues.createdBy)

//       let num1 = Number(createdby);
//       let Ceatorname = await db.User.findAll({
//         attributes: ['name'],
//         where: { id: num1 },
//         raw: true,
//       });
//       let Creatorname = Ceatorname.map(entry => entry.name);
//       Meetmember.push(num1)
//       let TeamName = (member.dataValues.name)


//       let email = await db.User.findAll({
//        attributes: ['email','name'],
//        where: { id: { [Op.in]: Meetmember } },
//        raw: true
//      });
   
//      let emails = email.map(entry => entry.email);
//      let Names = email.map(entry => entry.name);
//      console.log(Names)

//      for (let i = 0; i < emails.length; i++) {
//     const mailData = {
//         from: 'nirajkr00024@gmail.com',
//         to: emails[i],
//         subject: 'Team Created',
//         html: `
//           <style>
//             .container {
//               max-width: 700px;
//               margin: 0 auto;
//               padding: 24px 0;
//               font-family: "Poppins", sans-serif;
//               background-color: rgb(231 229 228);
//               border-radius: 1%;
//             }
//             .banner {
//               margin-bottom: 10px;
//               width: 90px;
//               height: 8vh;
//               margin-right: 20px;
//             }
//             .header {
//               display: flex;
//               align-items: center;
//               justify-content:center;
//               padding-top: 10px;
//             }
//             p {
//               margin-bottom: 15px;
//             }
//             .container-main {
//               max-width: 650px;
//               margin: 0 auto;
//               font-family: "serif", sans-serif;
//               background-color: #fafafa;
//               border-radius: 1%;
//             }
//             .content {
//               padding: 25px;
//             }
//             .footer {
//               background-color: rgb(249 115 22);
//               padding: 0.5em;
//               text-align: center;
//             }
//           </style>
//           <div class="container">
//             <div class="container-main">
//               <div class="header">
//                 <img
//                   src="https://upload-from-node.s3.ap-south-1.amazonaws.com/b66dcf3d-b7e7-4e5b-85d4-9052a6f6fa39-image+(6).png"
//                   alt="kapil_Groups_Logo"
//                   class="banner"
//                 />
//               </div>
//               <hr style="margin: 0" />
//               <div class="content">
//                 <h5 style="font-size: 1rem; font-weight: 500">
//                   Dear <span style="font-weight: bold">${Names[i]}</span>,
//                 </h5>
//                 <div style="font-size: 0.8rem">
//                   <p style="line-height: 1.4">
//                   We're excited to extend an invitation for you to join ${TeamName}. Here are the team members:
                   
//                   </p>
//                   <p> ${Names.join(', ')}</p>
     
//                   <p style="padding-top: 15px;">Warm regards,</p>
//                   <p>${Creatorname}</p>
//                   <p>Kapil Group</p>
//                 </div>
//               </div>
//               <div class="footer">
//                 <p style="color: white; font-size: 15px; margin: 0">
//                   All rights are reserved by Kapil Group
//                 </p>
//               </div>
//             </div>
//           </div>
//         `,
//       };

//     transporter.sendMail(mailData);
//     }


//       res.status(200).json({ message: "Team updated successfully" });
        
//     });
//   } catch (error) {
//     console.error("Error updating Teams:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

const UpdateTeam = async (req, res) => {
  try {
    let { id } = req.params;
    let data = req.body;
    let file = req.file;
    let image;

    // Handle file upload
    if (file) {
      const result = await uploadToS3(file);
      image = `${result.Location}`;
      data.image = image;
    }

    // Define the SQL query to update the Teams
    const updateQuery = 'UPDATE Teams SET ? WHERE id = ?';

    // Execute the update query using promises
    const updateResults = await new Promise((resolve, reject) => {
      mycon.query(updateQuery, [data, id], (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });

    // Find the updated team
    const member = await db.Team.findOne({ where: { id: id } });
    let Meetmember = member.dataValues.members;
    let createdBy = member.dataValues.createdBy;

    let num1 = Number(createdBy);
    let creatorData = await db.User.findAll({
      attributes: ['name'],
      where: { id: num1 },
      raw: true,
    });
    let creatorName = creatorData.map(entry => entry.name)[0];
    Meetmember.push(num1);
    let teamName = member.dataValues.name;

    let emailData = await db.User.findAll({
      attributes: ['email', 'name'],
      where: { id: { [Op.in]: Meetmember } },
      raw: true,
    });

    let emails = emailData.map(entry => entry.email);
    let names = emailData.map(entry => entry.name);

    // Send emails to the team members
    for (let i = 0; i < emails.length; i++) {
      const mailData = {
        from: 'nirajkr00024@gmail.com',
        to: emails[i],
        subject: `Updated  ${teamName}!`,
        html: `
          <style>
            .container {
              max-width: 700px;
              margin: 0 auto;
              padding: 24px 0;
              font-family: "Poppins", sans-serif;
              background-color: rgb(231 229 228);
              border-radius: 1%;
            }
            .banner {
              margin-bottom: 10px;
              width: 90px;
              height: 8vh;
              margin-right: 20px;
            }
            .header {
              display: flex;
              align-items: center;
              justify-content:center;
              padding-top: 10px;
            }
            p {
              margin-bottom: 15px;
            }
            .container-main {
              max-width: 650px;
              margin: 0 auto;
              font-family: "serif", sans-serif;
              background-color: #fafafa;
              border-radius: 1%;
            }
            .content {
              padding: 25px;
            }
            .footer {
              background-color: rgb(249 115 22);
              padding: 0.5em;
              text-align: center;
            }
          </style>
          <div class="container">
            <div class="container-main">
              <div class="header">
                <img
                  src="https://upload-from-node.s3.ap-south-1.amazonaws.com/b66dcf3d-b7e7-4e5b-85d4-9052a6f6fa39-image+(6).png"
                  alt="kapil_Groups_Logo"
                  class="banner"
                />
              </div>
              <hr style="margin: 0" />
              <div class="content">
                <h5 style="font-size: 1rem; font-weight: 500">
                  Dear <span style="font-weight: bold">${names[i]}</span>,
                </h5>
                <div style="font-size: 0.8rem">
                  <p style="line-height: 1.4">
                  We have updated the team details of ${teamName}. Here are the updated team members:

                   
                  </p>
                  <p> ${names.join(', ')}</p>
     
                  <p style="padding-top: 15px;">Warm regards,</p>
                  <p>${creatorName}</p>
                  <p>Kapil Group</p>
                </div>
              </div>
              <div class="footer">
                <p style="color: white; font-size: 15px; margin: 0">
                  All rights are reserved by Kapil Group
                </p>
              </div>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailData);
    }

    res.status(201).send(id);
  } catch (error) {
    console.error('Error updating Teams:', error);
    res.status(500).json({ error: 'Internal Server Error' });
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

  try {
    let whereClause = {
      name: { [Op.like]: `%${search}%` },
    };

    for (const [field, value] of Object.entries(filters)) {
      if (value !== '') {
        whereClause[field] = { [Op.like]: `%${value}%` };
      }
    }

    const options = {
      where: {}
    };
    if (req.teamsauth) {
      const teamsauthids = req.teamsauth.map(meet => meet.id);
      options.where = { id: { [Op.in]: teamsauthids } };
    } else {
      console.log("No authorized teams found in req.tasks");
      return res.status(403).json({ error: 'Unauthorized access to tasks' });
    }

    const { count, rows } = await db.Team.findAndCountAll({
      where: whereClause,
      order: [[sortBy, 'ASC']],
      limit: parseInt(pageSize),
      offset: offset
    });

    const totalPages = Math.ceil(count / pageSize);

    const extractUserIds = (rows) => {
      const userIds = new Set();
      rows.forEach(row => {
        if (Array.isArray(row.members)) {
          row.members.forEach(id => userIds.add(Number(id)));
        }
        if (row.createdBy) {
          userIds.add(Number(row.createdBy));
        }
      });
      return Array.from(userIds);
    };

    const getTaskCounts = async (team) => {
      const teamMeetings = await db.Meeting.findAll({
        where: { TeamId: team.id },
        attributes: ['id']
      });

      const meetingIds = teamMeetings.map(meeting => meeting.id);

      const teamUserIds = extractUserIds([team]);
      const collaboratorCondition = db.sequelize.where(
        db.sequelize.fn('JSON_CONTAINS', db.sequelize.col('collaborators'), JSON.stringify(teamUserIds)),
        true
      );

      const overDueCount = await db.Task.count({
        where: {
          [Op.or]: [
            collaboratorCondition,
            { members: teamUserIds },
            { createdBy: teamUserIds }
          ],
          dueDate: { [Op.lt]: new Date() },
          meetingId: { [Op.in]: meetingIds }
        }
      });

      const completedCount = await db.Task.count({
        where: {
          [Op.or]: [
            collaboratorCondition,
            { members: teamUserIds },
            { createdBy: teamUserIds }
          ],
          status: 'Completed',
          meetingId: { [Op.in]: meetingIds }
        }
      });

      const inProgressCount = await db.Task.count({
        where: {
          [Op.or]: [
            collaboratorCondition,
            { members: teamUserIds },
            { createdBy: teamUserIds }
          ],
          status: 'In-Progress',
          meetingId: { [Op.in]: meetingIds }
        }
      });

      const toDoCount = await db.Task.count({
        where: {
          [Op.or]: [
            collaboratorCondition,
            { members: teamUserIds },
            { createdBy: teamUserIds }
          ],
          status: 'To-Do',
          meetingId: { [Op.in]: meetingIds }
        }
      });

      const totalTaskCount = overDueCount + completedCount + inProgressCount + toDoCount;

      return {
        totalTaskCount,
        overDueCount,
        completedCount,
        inProgressCount,
        toDoCount,
      };
    };

    const teamsWithTaskCounts = await Promise.all(rows.map(async (team) => {
      const taskCounts = await getTaskCounts(team);
      return {
        ...team.dataValues,
        taskCounts,
      };
    }));

    if (teamsWithTaskCounts.length === 0) {
      return res.json({
        Teams: [],
        totalPages,
        currentPage: parseInt(page),
        pageSize: parseInt(pageSize),
        totalTeams: count,
        startTeam: offset + 1,
        endTeam: Math.min(offset + parseInt(pageSize), count),
        search
      });
    }

    const ids = teamsWithTaskCounts.map(item => item.id);
    const placeholders = ids.map(() => '?').join(',');

    mycon.query(`SELECT * FROM Teams WHERE id IN (${placeholders})`, ids, (err, resultmy) => {
      if (err) {
        console.error('Error retrieving data: ' + err.stack);
        res.status(500).send('Error retrieving data');
        return;
      }

      // Create a map for quick lookup by id
      const resultMap = new Map(resultmy.map(item => [item.id, item]));

      // Merge additional columns
      const mergedTeams = teamsWithTaskCounts.map(team => {
        const additionalData = resultMap.get(team.id);
        if (additionalData) {
          // Add any new columns from resultmy to the team object
          for (const key in additionalData) {
            if (!team.hasOwnProperty(key)) {
              team[key] = additionalData[key];
            }
          }
        }
        return team;
      });

      res.json({
        Teams: mergedTeams,
        totalPages,
        currentPage: parseInt(page),
        pageSize: parseInt(pageSize),
        totalTeams: count,
        startTeam: offset + 1,
        endTeam: Math.min(offset + parseInt(pageSize), count),
        search
      });
    });

  } catch (err) {
    console.error('Error executing Sequelize query: ' + err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
};



// const ListTeam = async (req, res) => {
//   const { search = '', page = 1, pageSize = 5, sortBy = 'createdAt', ...restQueries } = req.query;

//   const filters = {};
//   for (const key in restQueries) {
//     filters[key] = restQueries[key];
//   }

//   const offset = (parseInt(page) - 1) * parseInt(pageSize);

//   try {
//     let whereClause = {
//       name: { [Op.like]: `%${search}%` },
//     };

//     for (const [field, value] of Object.entries(filters)) {
//       if (value !== '') {
//         whereClause[field] = { [Op.like]: `%${value}%` };
//       }
//     }

//     const options = {
//       where: {}
//     };
//     if (req.teamsauth) {
//       const teamsauthids = req.teamsauth.map(meet => meet.id);
//       options.where = { id: { [Op.in]: teamsauthids } };
//     } else {
//       console.log("No authorized teams found in req.tasks");
//       return res.status(403).json({ error: 'Unauthorized access to tasks' });
//     }

//     const { count, rows } = await db.Team.findAndCountAll({
//       where: whereClause,
//       order: [[sortBy, 'ASC']],
//       limit: parseInt(pageSize),
//       offset: offset
//     });

//     const totalPages = Math.ceil(count / pageSize);

//     const extractUserIds = (rows) => {
//       const userIds = new Set();
//       rows.forEach(row => {
//         if (Array.isArray(row.members)) {
//           row.members.forEach(id => userIds.add(Number(id)));
//         }
//         if (row.createdBy) {
//           userIds.add(Number(row.createdBy));
//         }
//       });
//       return Array.from(userIds);
//     };

//     const getTaskCounts = async (team) => {
//       const teamMeetings = await db.Meeting.findAll({
//         where: { TeamId: team.id },
//         attributes: ['id']
//       });

//       const meetingIds = teamMeetings.map(meeting => meeting.id);

//       const teamUserIds = extractUserIds([team]);
//       const collaboratorCondition = db.sequelize.where(
//         db.sequelize.fn('JSON_CONTAINS', db.sequelize.col('collaborators'), JSON.stringify(teamUserIds)),
//         true
//       );

//       const overDueCount = await db.Task.count({
//         where: {
//           [Op.or]: [
//             collaboratorCondition,
//             { members: teamUserIds },
//             { createdBy: teamUserIds }
//           ],
//           dueDate: { [Op.lt]: new Date() },
//           meetingId: { [Op.in]: meetingIds }
//         }
//       });

//       const completedCount = await db.Task.count({
//         where: {
//           [Op.or]: [
//             collaboratorCondition,
//             { members: teamUserIds },
//             { createdBy: teamUserIds }
//           ],
//           status: 'Completed',
//           meetingId: { [Op.in]: meetingIds }
//         }
//       });

//       const inProgressCount = await db.Task.count({
//         where: {
//           [Op.or]: [
//             collaboratorCondition,
//             { members: teamUserIds },
//             { createdBy: teamUserIds }
//           ],
//           status: 'In-Progress',
//           meetingId: { [Op.in]: meetingIds }
//         }
//       });

//       const toDoCount = await db.Task.count({
//         where: {
//           [Op.or]: [
//             collaboratorCondition,
//             { members: teamUserIds },
//             { createdBy: teamUserIds }
//           ],
//           status: 'To-Do',
//           meetingId: { [Op.in]: meetingIds }
//         }
//       });

//       const totalTaskCount = overDueCount + completedCount + inProgressCount + toDoCount;

//       return {
//         totalTaskCount,
//         overDueCount,
//         completedCount,
//         inProgressCount,
//         toDoCount,
//       };
//     };

//     const teamsWithTaskCounts = await Promise.all(rows.map(async (team) => {
//       const taskCounts = await getTaskCounts(team);
//       return {
//         ...team.dataValues,
//         taskCounts,
//       };
//     }));

//     const ids = teamsWithTaskCounts.map(item => item.id);
//     const placeholders = ids.map(() => '?').join(',');

//     mycon.query(`SELECT * FROM Teams WHERE id IN (${placeholders})`, ids, (err, resultmy) => {
//       if (err) {
//         console.error('Error retrieving data: ' + err.stack);
//         res.status(500).send('Error retrieving data');
//         return;
//       }

//       // Create a map for quick lookup by id
//       const resultMap = new Map(resultmy.map(item => [item.id, item]));

//       // Merge additional columns
//       const mergedTeams = teamsWithTaskCounts.map(team => {
//         const additionalData = resultMap.get(team.id);
//         if (additionalData) {
//           // Add any new columns from resultmy to the team object
//           for (const key in additionalData) {
//             if (!team.hasOwnProperty(key)) {
//               team[key] = additionalData[key];
//             }
//           }
//         }
//         return team;
//       });

//       res.json({
//         Teams: mergedTeams,
//         totalPages,
//         currentPage: parseInt(page),
//         pageSize: parseInt(pageSize),
//         totalTeams: count,
//         startTeam: offset + 1,
//         endTeam: Math.min(offset + parseInt(pageSize), count),
//         search
//       });
//     });

//   } catch (err) {
//     console.error('Error executing Sequelize query: ' + err.stack);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };


// const ListTeam = async (req, res) => {
//   const { search = '', page = 1, pageSize = 5, sortBy = 'createdAt', ...restQueries } = req.query;
//   const filters = {};
//   for (const key in restQueries) {
//     filters[key] = restQueries[key];
//   }
//   const offset = (parseInt(page) - 1) * parseInt(pageSize);

//   // MySQL query to fetch paginated teams
//   let sql = `SELECT * FROM Teams WHERE (name LIKE '%${search}%')`;

//   // Add conditions for additional filter fields
//   for (const [field, value] of Object.entries(filters)) {
//     if (value !== '') {
//       sql += ` AND ${field} LIKE '%${value}%'`; // Add the condition
//     }
//   }

//   // Add LIMIT and OFFSET clauses to the SQL query
//   sql += ` ORDER BY ${sortBy} LIMIT ? OFFSET ?`;

//   mycon.query(sql, [parseInt(pageSize), offset], (err, result) => {
//     if (err) {
//       console.error('Error executing MySQL query: ' + err.stack);
//       res.status(500).json({ error: 'Internal server error' });
//       return;
//     }

//     // Execute the count query to get the total number of teams
//     let sqlCount = `SELECT COUNT(*) as total FROM Teams WHERE (name LIKE '%${search}%')`;

//     // Add conditions for additional filter fields
//     for (const [field, value] of Object.entries(filters)) {
//       if (value !== '') {
//         sqlCount += ` AND ${field} LIKE '%${value}%'`;
//       }
//     }

//     mycon.query(sqlCount, (err, countResult) => {
//       if (err) {
//         console.error('Error executing MySQL count query: ' + err.stack);
//         res.status(500).json({ error: 'Internal server error' });
//         return;
//       }

//       const totalTeams = countResult[0].total;
//       const totalPages = Math.ceil(totalTeams / pageSize);

//       res.json({
//         Teams: result,
//         totalPages: parseInt(totalPages),
//         currentPage: parseInt(page),
//         pageSize: parseInt(pageSize),
//         totalTeams: parseInt(totalTeams),
//         startTeam: parseInt(offset) + 1, // Correct the start team index
//         endTeam: parseInt(offset) + parseInt(pageSize), // Correct the end team index
//         search
//       });
//     });
//   });
// };






// niraj check this


// const ListTeam = async (req, res) => {
//   const { search = '', page = 1, pageSize = 5, sortBy = 'createdAt', ...restQueries } = req.query;
//   const offset = (parseInt(page) - 1) * parseInt(pageSize);

//   // Define the search conditions using Sequelize operators
//   const condition = {
//     name: { [Op.like]: `%${search}%` }
//   };

//   // Include additional filters in the condition
//   Object.entries(restQueries).forEach(([field, value]) => {
//     if (value !== '') {
//       condition[field] = { [Op.like]: `%${value}%` };
//     }
//   });

  
// // console.log("pageSize", pageSize)
//   try {
    
//     const optionss = {
//       where: {}
//     };
//     if (req.teamsauth) {
//       const teamsauthids = req.teamsauth.map(meet => meet.id);
//       // console.log("Authorized teamss IDs:", teamsauthids);
//       optionss.where = { id: { [Op.in]: teamsauthids } };
//     } else {
//       console.log("No authorized teams found in req.tasks");
//       return res.status(403).json({ error: 'Unauthorized access to tasks' });
//     }
//     // Execute the findAndCountAll method to fetch the paginated results and total count
//     const { count, rows } = await db.Team.findAndCountAll(optionss,{
//       where: condition,
//       order: [[sortBy, 'ASC']],
//       limit: parseInt(pageSize),
//       offset: offset
//     });

//     const totalPages = Math.ceil(count / pageSize);

//     // Function to extract unique numeric user IDs from members and createdBy fields
//     const extractUserIds = (rows) => {
//       const userIds = new Set();
//       rows.forEach(row => {
//         if (Array.isArray(row.members)) {
//           row.members.forEach(id => userIds.add(Number(id)));
//         }
//         if (row.createdBy) {
//           userIds.add(Number(row.createdBy));
//         }
//       });
//       return Array.from(userIds);
//     };

//     const userIdArray = extractUserIds(rows);


//     if (userIdArray.length === 0) {
//       return res.json({
//         Teams: rows,
//         totalPages,
//         currentPage: parseInt(page),
//         pageSize: parseInt(pageSize),
//         totalTeams: count,
//         startTeam: offset + 1,
//         endTeam: Math.min(offset + parseInt(pageSize), count),
//         search,
//         taskCounts: {
//           totalTaskCount: 0,
//           overDueCount: 0,
//           completedCount: 0,
//           inProgressCount: 0,
//           toDoCount: 0,
//         }
//       });
//     }

//     // Function to get task counts for a specific team
//     const getTaskCounts = async (team) => {
//       const teamUserIds = extractUserIds([team]);
//       const collaboratorCondition = db.sequelize.where(
//         db.sequelize.fn('JSON_CONTAINS', db.sequelize.col('collaborators'), JSON.stringify(teamUserIds)),
//         true
//       );

//       const overDueCount = await db.Task.count({
//         where: {
//           [Op.or]: [
//             collaboratorCondition,
//             { members: teamUserIds },
//             { createdBy: teamUserIds }
//           ],
//           dueDate: { [Op.lt]: new Date() },
//           status: { [Op.ne]: 'Completed' }
//         }
//       });

//       const completedCount = await db.Task.count({
//         where: {
//           [Op.or]: [
//             collaboratorCondition,
//             { members: teamUserIds },
//             { createdBy: teamUserIds }
//           ],
//           status: 'Completed'
//         }
//       });

//       const inProgressCount = await db.Task.count({
//         where: {
//           [Op.or]: [
//             collaboratorCondition,
//             { members: teamUserIds },
//             { createdBy: teamUserIds }
//           ],
//           status: 'In-Progress'
//         }
//       });

//       const toDoCount = await db.Task.count({
//         where: {
//           [Op.or]: [
//             collaboratorCondition,
//             { members: teamUserIds },
//             { createdBy: teamUserIds }
//           ],
//           status: 'To-Do'
//         }
//       });

//       const totalTaskCount = overDueCount + completedCount + inProgressCount + toDoCount;

//       return {
//         totalTaskCount,
//         overDueCount,
//         completedCount,
//         inProgressCount,
//         toDoCount,
//       };
//     };

//     // Add task counts to each entity
//     const teamsWithTaskCounts = await Promise.all(rows.map(async (entity) => {
//       const taskCounts = await getTaskCounts(entity);
//       return {
//         ...entity.dataValues,
//         taskCounts,
//       };
//     }));

//     res.json({
//       Teams: teamsWithTaskCounts,
//       totalPages,
//       currentPage: parseInt(page),
//       pageSize: parseInt(pageSize),
//       totalTeams: count,
//       startTeam: offset + 1,
//       endTeam: Math.min(offset + parseInt(pageSize), count),
//       search
//     });
//   } catch (err) {
//     console.error('Error executing Sequelize query: ' + err.stack);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };


// const ListTeam = async (req, res) => {
//   const { search = '', page = 1, pageSize = 5, sortBy = 'createdAt', ...restQueries } = req.query;
//   const offset = (parseInt(page) - 1) * parseInt(pageSize);

//   // Define the search conditions using Sequelize operators
//   const condition = {
//     name: { [Op.like]: `%${search}%` }
//   };

//   // Include additional filters in the condition
//   Object.entries(restQueries).forEach(([field, value]) => {
//     if (value !== '') {
//       condition[field] = { [Op.like]: `%${value}%` };
//     }
//   });

  
// // console.log("pageSize", pageSize)
//   try {
    
//     const optionss = {
//       where: {}
//     };
//     if (req.teamsauth) {
//       const teamsauthids = req.teamsauth.map(meet => meet.id);
//       // console.log("Authorized teamss IDs:", teamsauthids);
//       optionss.where = { id: { [Op.in]: teamsauthids } };
//     } else {
//       console.log("No authorized teams found in req.tasks");
//       return res.status(403).json({ error: 'Unauthorized access to tasks' });
//     }
//     // Execute the findAndCountAll method to fetch the paginated results and total count
//     const { count, rows } = await db.Team.findAndCountAll(optionss,{
//       where: condition,
//       order: [[sortBy, 'ASC']],
//       limit: parseInt(pageSize),
//       offset: offset
//     });

//     const totalPages = Math.ceil(count / pageSize);

//     // Function to extract unique numeric user IDs from members and createdBy fields
//     const extractUserIds = (rows) => {
//       const userIds = new Set();
//       rows.forEach(row => {
//         if (Array.isArray(row.members)) {
//           row.members.forEach(id => userIds.add(Number(id)));
//         }
//         if (row.createdBy) {
//           userIds.add(Number(row.createdBy));
//         }
//       });
//       return Array.from(userIds);
//     };

//     const userIdArray = extractUserIds(rows);


//     if (userIdArray.length === 0) {
//       return res.json({
//         Teams: rows,
//         totalPages,
//         currentPage: parseInt(page),
//         pageSize: parseInt(pageSize),
//         totalTeams: count,
//         startTeam: offset + 1,
//         endTeam: Math.min(offset + parseInt(pageSize), count),
//         search,
//         taskCounts: {
//           totalTaskCount: 0,
//           overDueCount: 0,
//           completedCount: 0,
//           inProgressCount: 0,
//           toDoCount: 0,
//         }
//       });
//     }

//     // Function to get task counts for a specific team
//     const getTaskCounts = async (team) => {
//       const teamUserIds = extractUserIds([team]);
//       const collaboratorCondition = db.sequelize.where(
//         db.sequelize.fn('JSON_CONTAINS', db.sequelize.col('collaborators'), JSON.stringify(teamUserIds)),
//         true
//       );

//       const overDueCount = await db.Task.count({
//         where: {
//           [Op.or]: [
//             collaboratorCondition,
//             { members: teamUserIds },
//             { createdBy: teamUserIds }
//           ],
//           dueDate: { [Op.lt]: new Date() },
//           status: { [Op.ne]: 'Completed' }
//         }
//       });

//       const completedCount = await db.Task.count({
//         where: {
//           [Op.or]: [
//             collaboratorCondition,
//             { members: teamUserIds },
//             { createdBy: teamUserIds }
//           ],
//           status: 'Completed'
//         }
//       });

//       const inProgressCount = await db.Task.count({
//         where: {
//           [Op.or]: [
//             collaboratorCondition,
//             { members: teamUserIds },
//             { createdBy: teamUserIds }
//           ],
//           status: 'In-Progress'
//         }
//       });

//       const toDoCount = await db.Task.count({
//         where: {
//           [Op.or]: [
//             collaboratorCondition,
//             { members: teamUserIds },
//             { createdBy: teamUserIds }
//           ],
//           status: 'To-Do'
//         }
//       });

//       const totalTaskCount = overDueCount + completedCount + inProgressCount + toDoCount;

//       return {
//         totalTaskCount,
//         overDueCount,
//         completedCount,
//         inProgressCount,
//         toDoCount,
//       };
//     };

//     // Add task counts to each entity
//     const teamsWithTaskCounts = await Promise.all(rows.map(async (entity) => {
//       const taskCounts = await getTaskCounts(entity);
//       return {
//         ...entity.dataValues,
//         taskCounts,
//       };
//     }));

//     res.json({
//       Teams: teamsWithTaskCounts,
//       totalPages,
//       currentPage: parseInt(page),
//       pageSize: parseInt(pageSize),
//       totalTeams: count,
//       startTeam: offset + 1,
//       endTeam: Math.min(offset + parseInt(pageSize), count),
//       search
//     });
//   } catch (err) {
//     console.error('Error executing Sequelize query: ' + err.stack);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };




// const ListTeam = async (req, res) => {
//   const { search = '', page = 1, pageSize = 5, sortBy = 'createdAt', ...restQueries } = req.query;
//   const offset = (parseInt(page) - 1) * parseInt(pageSize);

//   const condition = {
//     name: { [Op.like]: `%${search}%` }
//   };

//   Object.entries(restQueries).forEach(([field, value]) => {
//     if (value !== '') {
//       condition[field] = { [Op.like]: `%${value}%` };
//     }
//   });

//   try {
//     const options = {
//       where: {}
//     };

//     if (req.teamsauth) {
//       const teamsauthids = req.teamsauth.map(meet => meet.id);
//       options.where = { id: { [Op.in]: teamsauthids } };
//     } else {
//       console.log("No authorized teams found in req.tasks");
//       return res.status(403).json({ error: 'Unauthorized access to tasks' });
//     }

//     const { count, rows } = await db.Team.findAndCountAll({
//       where: condition,
//       order: [[sortBy, 'ASC']],
//       limit: parseInt(pageSize),
//       offset: offset,
//       ...options
//     });

//     const totalPages = Math.ceil(count / pageSize);

//     const extractUserIds = (rows) => {
//       const userIds = new Set();
//       rows.forEach(row => {
//         if (Array.isArray(row.members)) {
//           row.members.forEach(id => userIds.add(Number(id)));
//         }
//         if (row.createdBy) {
//           userIds.add(Number(row.createdBy));
//         }
//       });
//       return Array.from(userIds);
//     };

//     const userIdArray = extractUserIds(rows);

//     if (userIdArray.length === 0) {
//       return res.json({
//         Teams: rows,
//         totalPages,
//         currentPage: parseInt(page),
//         pageSize: parseInt(pageSize),
//         totalTeams: count,
//         startTeam: offset + 1,
//         endTeam: Math.min(offset + parseInt(pageSize), count),
//         search,
//         taskCounts: {
//           totalTaskCount: 0,
//           overDueCount: 0,
//           completedCount: 0,
//           inProgressCount: 0,
//           toDoCount: 0,
//         }
//       });
//     }

//     const getTaskCounts = async (team) => {
//       const taskCounts = {
//         totalTaskCount: 0,
//         overDueCount: 0,
//         completedCount: 0,
//         inProgressCount: 0,
//         toDoCount: 0,
//       };

//       const teamUserIds = Array.isArray(team.members) ? team.members : [];
//       const teamUserIdscreatedby = team.createdBy;
//       // const teamuser = teamUserIds.includes(userId)
//       teamUserIds.push(teamUserIdscreatedby);

//       console.log("userIds", userIds)

//       for (const userId of teamUserIds) {
//         const userConditions = {
//           [Op.or]: [
//             db.sequelize.where(
//               db.sequelize.fn('JSON_CONTAINS', db.sequelize.col('collaborators'), JSON.stringify(userId)),
//               true
//             ),
//           {members: userId},
//           { createdBy: userId }
//             // { collaborators: { [Op.like]: `%${userId}%` } },
//             // { members: { [Op.like]: `%${userId}%` } },
//             // { createdBy: userId }
//           ]
//         };

//         taskCounts.overDueCount += await db.Task.count({
//           where: {
//             ...userConditions,
//             dueDate: { [Op.lt]: new Date() },
//             // status: { [Op.ne]: 'Completed' },
//             // dueDate: null,
//           }
//         });

//         taskCounts.completedCount += await db.Task.count({
//           where: {
//             ...userConditions,
//             status: 'Completed'
//           }
//         });

//         taskCounts.inProgressCount += await db.Task.count({
//           where: {
//             ...userConditions,
//             status: 'In-Progress'
//           }
//         });

//         taskCounts.toDoCount += await db.Task.count({
//           where: {
//             ...userConditions,
//             status: 'To-Do'
//           }
//         });
//       }

//       taskCounts.totalTaskCount = taskCounts.overDueCount + taskCounts.completedCount + taskCounts.inProgressCount + taskCounts.toDoCount;

//       return taskCounts;
//     };

//     const teamsWithTaskCounts = await Promise.all(rows.map(async (entity) => {
//       const taskCounts = await getTaskCounts(entity);
//       return {
//         ...entity.dataValues,
//         taskCounts,
//       };
//     }));

//     res.json({
//       Teams: teamsWithTaskCounts,
//       totalPages,
//       currentPage: parseInt(page),
//       pageSize: parseInt(pageSize),
//       totalTeams: count,
//       startTeam: offset + 1,
//       endTeam: Math.min(offset + parseInt(pageSize), count),
//       search
//     });
//   } catch (err) {
//     console.error('Error executing Sequelize query: ' + err.stack);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };


// pesend working code
// const ListTeam = async (req, res) => {
//   const { search = '', page = 1, pageSize = 5, sortBy = 'createdAt', ...restQueries } = req.query;
//   const offset = (parseInt(page) - 1) * parseInt(pageSize);

//   // Define the search conditions using Sequelize operators
//   const condition = {
//     name: { [Op.like]: `%${search}%` }
//   };

//   // Include additional filters in the condition
//   Object.entries(restQueries).forEach(([field, value]) => {
//     if (value !== '') {
//       condition[field] = { [Op.like]: `%${value}%` };
//     }
//   });

//   try {
//     const options = {
//       where: {}
//     };
//     if (req.teamsauth) {
//       const teamsauthids = req.teamsauth.map(meet => meet.id);
//       options.where = { id: { [Op.in]: teamsauthids } };
//     } else {
//       console.log("No authorized teams found in req.tasks");
//       return res.status(403).json({ error: 'Unauthorized access to tasks' });
//     }

//     const { count, rows } = await db.Team.findAndCountAll(options, {
//       where: condition,
//       order: [[sortBy, 'ASC']],
//       limit: parseInt(pageSize),
//       offset: offset
//     });

//     const totalPages = Math.ceil(count / pageSize);

//     // Function to extract unique numeric user IDs from members and createdBy fields
//     const extractUserIds = (rows) => {
//       const userIds = new Set();
//       rows.forEach(row => {
//         if (Array.isArray(row.members)) {
//           row.members.forEach(id => userIds.add(Number(id)));
//         }
//         if (row.createdBy) {
//           userIds.add(Number(row.createdBy));
//         }
//       });
//       return Array.from(userIds);
//     };

//     const getTaskCounts = async (team) => {
//       const teamMeetings = await db.Meeting.findAll({
//         where: { TeamId: team.id },
//         attributes: ['id']
//       });

//       const meetingIds = teamMeetings.map(meeting => meeting.id);

//       const teamUserIds = extractUserIds([team]);
//       const collaboratorCondition = db.sequelize.where(
//         db.sequelize.fn('JSON_CONTAINS', db.sequelize.col('collaborators'), JSON.stringify(teamUserIds)),
//         true
//       );

//       const overDueCount = await db.Task.count({
//         where: {
//           [Op.or]: [
//             collaboratorCondition,
//             { members: teamUserIds },
//             { createdBy: teamUserIds }
//           ],
//           dueDate: { [Op.lt]: new Date() },
//           meetingId: { [Op.in]: meetingIds }
//         }
//       });

//       const completedCount = await db.Task.count({
//         where: {
//           [Op.or]: [
//             collaboratorCondition,
//             { members: teamUserIds },
//             { createdBy: teamUserIds }
//           ],
//           status: 'Completed',
//           meetingId: { [Op.in]: meetingIds }
//         }
//       });

//       const inProgressCount = await db.Task.count({
//         where: {
//           [Op.or]: [
//             collaboratorCondition,
//             { members: teamUserIds },
//             { createdBy: teamUserIds }
//           ],
//           status: 'In-Progress',
//           meetingId: { [Op.in]: meetingIds }
//         }
//       });

//       const toDoCount = await db.Task.count({
//         where: {
//           [Op.or]: [
//             collaboratorCondition,
//             { members: teamUserIds },
//             { createdBy: teamUserIds }
//           ],
//           status: 'To-Do',
//           meetingId: { [Op.in]: meetingIds }
//         }
//       });

//       const totalTaskCount = overDueCount + completedCount + inProgressCount + toDoCount;

//       return {
//         totalTaskCount,
//         overDueCount,
//         completedCount,
//         inProgressCount,
//         toDoCount,
//       };
//     };

//     const teamsWithTaskCounts = await Promise.all(rows.map(async (team) => {
//       const taskCounts = await getTaskCounts(team);
//       return {
//         ...team.dataValues,
//         taskCounts,
//       };
//     }));

//     res.json({
//       Teams: teamsWithTaskCounts,
//       totalPages,
//       currentPage: parseInt(page),
//       pageSize: parseInt(pageSize),
//       totalTeams: count,
//       startTeam: offset + 1,
//       endTeam: Math.min(offset + parseInt(pageSize), count),
//       search
//     });
//   } catch (err) {
//     console.error('Error executing Sequelize query: ' + err.stack);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };


// added filters
// const ListTeam = async (req, res) => {
//   const { search = '', page = 1, pageSize = 5, sortBy = 'createdAt', ...restQueries } = req.query;

//   const filters = {};
//   for (const key in restQueries) {
//     filters[key] = restQueries[key];
//   }

//   const offset = (parseInt(page) - 1) * parseInt(pageSize);

//   // // Split and validate sortBy parameter
//   // let sortField = 'id';
//   // let sortOrder = 'DESC';
//   // if (sortBy) {
//   //   const sortParts = sortBy.split(' ');
//   //   if (sortParts.length === 2) {
//   //     [sortField, sortOrder] = sortParts;
//   //   }
//   // }
//   // const validSortOrders = ['ASC', 'DESC'];
//   // sortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
//   // const order = [[sortField, sortOrder]];


//   // Split and validate sortBy parameter
//   // let sortField = 'id';
//   // let sortOrder = 'DESC';
//   // if (sortBy) {
//   //   const sortParts = sortBy.split(' ');
//   //   if (sortParts.length === 2) {
//   //     [sortField, sortOrder] = sortParts;
//   //   }
//   // }
//   // const validSortOrders = ['ASC', 'DESC'];
//   // sortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
//   // const order = [[sortField, sortOrder]];

//   try {

//     let whereClause = {
//       name: { [Op.like]: `%${search}%` },
//     };

//     // Add additional filters
//     for (const [field, value] of Object.entries(filters)) {
//       if (value !== '') {
//         whereClause[field] = { [Op.like]: `%${value}%` };
//       }
//     }

//     const options = {
//       where: {}
//     };
//     if (req.teamsauth) {
//       const teamsauthids = req.teamsauth.map(meet => meet.id);
//       options.where = { id: { [Op.in]: teamsauthids } };
//     } else {
//       console.log("No authorized teams found in req.tasks");
//       return res.status(403).json({ error: 'Unauthorized access to tasks' });
//     }

//     const { count, rows } = await db.Team.findAndCountAll({
//       // where: condition,
//       where: whereClause,
//       // order,
//       order: [[sortBy, 'ASC']],
//       limit: parseInt(pageSize),
//       offset: offset
//     });

//     const totalPages = Math.ceil(count / pageSize);

//     // Function to extract unique numeric user IDs from members and createdBy fields
//     const extractUserIds = (rows) => {
//       const userIds = new Set();
//       rows.forEach(row => {
//         if (Array.isArray(row.members)) {
//           row.members.forEach(id => userIds.add(Number(id)));
//         }
//         if (row.createdBy) {
//           userIds.add(Number(row.createdBy));
//         }
//       });
//       return Array.from(userIds);
//     };

//     const getTaskCounts = async (team) => {
//       const teamMeetings = await db.Meeting.findAll({
//         where: { TeamId: team.id },
//         attributes: ['id']
//       });

//       const meetingIds = teamMeetings.map(meeting => meeting.id);

//       const teamUserIds = extractUserIds([team]);
//       const collaboratorCondition = db.sequelize.where(
//         db.sequelize.fn('JSON_CONTAINS', db.sequelize.col('collaborators'), JSON.stringify(teamUserIds)),
//         true
//       );

//       const overDueCount = await db.Task.count({
//         where: {
//           [Op.or]: [
//             collaboratorCondition,
//             { members: teamUserIds },
//             { createdBy: teamUserIds }
//           ],
//           dueDate: { [Op.lt]: new Date() },
//           meetingId: { [Op.in]: meetingIds }
//         }
//       });

//       const completedCount = await db.Task.count({
//         where: {
//           [Op.or]: [
//             collaboratorCondition,
//             { members: teamUserIds },
//             { createdBy: teamUserIds }
//           ],
//           status: 'Completed',
//           meetingId: { [Op.in]: meetingIds }
//         }
//       });

//       const inProgressCount = await db.Task.count({
//         where: {
//           [Op.or]: [
//             collaboratorCondition,
//             { members: teamUserIds },
//             { createdBy: teamUserIds }
//           ],
//           status: 'In-Progress',
//           meetingId: { [Op.in]: meetingIds }
//         }
//       });

//       const toDoCount = await db.Task.count({
//         where: {
//           [Op.or]: [
//             collaboratorCondition,
//             { members: teamUserIds },
//             { createdBy: teamUserIds }
//           ],
//           status: 'To-Do',
//           meetingId: { [Op.in]: meetingIds }
//         }
//       });

//       const totalTaskCount = overDueCount + completedCount + inProgressCount + toDoCount;

//       return {
//         totalTaskCount,
//         overDueCount,
//         completedCount,
//         inProgressCount,
//         toDoCount,
//       };
//     };

//     const teamsWithTaskCounts = await Promise.all(rows.map(async (team) => {
//       const taskCounts = await getTaskCounts(team);
//       return {
//         ...team.dataValues,
//         taskCounts,
//       };
//     }));

//     const ids = teamsWithTaskCounts.map(item => item.id);

// // Convert array of IDs into a string of placeholders for the SQL query
//    const placeholders = ids.map(() => '?').join(',');

//    mycon.query(`SELECT * FROM Teams WHERE id IN (${placeholders})`, ids, (err, resultmy) => {
//   if (err) {
//     console.error('Error retrieving data: ' + err.stack);
//     res.status(500).send('Error retrieving data');
//     return;
//   }

//   // Process the result as needed
//   console.log(resultmy);
// });



//     res.json({
//       Teams: teamsWithTaskCounts,
//       totalPages,
//       currentPage: parseInt(page),
//       pageSize: parseInt(pageSize),
//       totalTeams: count,
//       startTeam: offset + 1,
//       endTeam: Math.min(offset + parseInt(pageSize), count),
//       search
//     });
//   } catch (err) {
//     console.error('Error executing Sequelize query: ' + err.stack);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };





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




// const getTeamDataById = (req, res) => {
//   const entityId = req.params.id;
//   mycon.query('SELECT * FROM Teams WHERE id = ?', entityId, (err, result) => {
//     if (err) {
//       console.error('Error retrieving data: ' + err.stack);
//       res.status(500).send('Error retrieving data');
//       return;
//     }

//     if (result.length === 0) {
//       res.status(404).send('Teams data not found');
//       return;
//     }

//     res.status(200).json(result[0]);
//   });
// };


const getTeamDataById = async (req, res) => {
    try {
      // Step 1: Fetch the meeting by its ID
      const teamDetails = await Team.findOne({
        where: { id: req.params.id },
      });
  
      // Check if meeting exists
      if (!teamDetails) {
        return res.status(404).json({ error: 'TeamDetails not found' });
      }
  
      // Step 2: Extract the user IDs from the members column
      let members = teamDetails.members;
  
      const memberIds = Array.isArray(members) ? members : [];
  
  
      // console.log("memberIds:", memberIds); // Log memberIds to verify the IDs
  
      // Step 4: If no member IDs found, return the meeting with empty members array
      if (memberIds.length === 0) {
        const updatedTeam = {
          ...teamDetails.toJSON(),
          members: [],
        };
        return res.status(200).json(updatedTeam);
      }
  
      // Step 5: Query the User table to get the details of these users
      const users = await db.User.findAll({
        attributes: ['id', 'image', 'name', 'email'],
        where: {
          id: {
            [Op.in]: memberIds,
          },
        },
        logging: console.log, // Enable logging to inspect the query
      });
  
      const updatedTeam = {
        ...teamDetails.toJSON(),
        members: users,
      };
  
      res.status(201).json(updatedTeam);
    } catch (error) {
      console.error('Error fetching meeting details:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };



module.exports = { CreateTeam, getTeamDataById, ListTeam, DeleteTeamById, UpdateTeam, List_Team_Pub };
