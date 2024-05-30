var db = require('../models/index');
const Meet = db.Meeting;
const mycon = require('../DB/mycon');
const Team = db.Team
const Entity = db.Entity
const { Op } = require('sequelize');
const uploadToS3 = require('../utils/wearhouse')
// const User = db.User;


// const CreateMeeting = async (req, res) => {
//   try {
//     let file = req.file;
//     let data = req.body;
//     let Query = req.query;

//     // Extracting entityId and teamId from query parameters
//     const entityId = Query?.entity ?? null;
//     const teamId = Query?.team ?? null;
//     const userId = Query?.user ?? null;

//     // Modify data if file is present
//     if (file) {
//       const result = await uploadToS3(req.file);
//       data = {
//         image: `${result.Location}`,
//         ...data,
//       };
//     }

//     // Inserting data into the Meetings table
//     const insertQuery = 'INSERT INTO Meetings SET ?';
//     const result = await new Promise((resolve, reject) => {
//       mycon.query(insertQuery, data, (err, result) => {
//         if (err) reject(err);
//         resolve(result);
//       });
//     });
//     const createdMeeting = await db.Meeting.findOne({ where: { id: result.insertId } });
//     if (createdMeeting) {
//       if (entityId) {
//         const entity = await Entity.findOne({ where: { id: entityId } });
//         await createdMeeting.setEntity(entity);
//       } else if (userId) {
//         const user = await db.User.findOne({ where: { id: userId } });
//         await createdMeeting.setUser(user);
//       }
//       else if (teamId) {
//         const team = await Team.findOne({ where: { id: teamId } });
//         await createdMeeting.setTeam(team);
//       }
//     }
//    let insertId =(result.insertId)
//    const member = await db.Meeting.findOne({ where: { id:insertId } });
//    Meetmember = (member.dataValues.members)
//    createdby = (member.dataValues.createdBy)
//    let num1 = Number(createdby);
//    Meetmember.push(num1)
//    let num = Number(userId);
//    Meetmember.push(num)
//    let email = await db.User.findAll({
//     attributes: ['email','name'],
//     where: { id: { [Op.in]: Meetmember } },
//     raw: true
//   });

//   let emails = email.map(entry => entry.email);
//   let name = email.map(entry => entry.name);
//   console.log(name,emails)



// const mailData = {
//   from: 'nirajkr00024@gmail.com',
//   to: emails,
//   subject: 'Board meeting Created',
//   html: `
//       <style>
//       .container {
//           max-width: 700px;
//           margin: 0 auto;
//           padding: 24px 0;
//           font-family: "Poppins", sans-serif;
//           background-color: rgb(231 229 228);
//           border-radius: 1%;
//         }
//         .banner {
//           margin-bottom: 10px;
//           width: 90px;
//           height: 8vh;
//           margin-right: 20px;
//         }
    
//         .header {
//           display: flex;
//           align-items: center;
    
//           padding-top: 10px;
//         }
    
//         p {
//           margin-bottom: 15px;
//         }
//         .container-main {
//           max-width: 650px;
//           margin: 0 auto;
    
//           font-family: "serif", sans-serif;
//           background-color: #fafafa;
//           border-radius: 1%;
//         }
//         .content {
//           padding: 25px;
//         }
//         .footer {
//           background-color: rgb(249 115 22);
//           padding: 0.5em;
//           text-align: center;
//         }
//         </style>
//         <div class="container">
//         <div class="container-main">
//           <div class="header">
//             <img
//               src="https://upload-from-node.s3.ap-south-1.amazonaws.com/b66dcf3d-b7e7-4e5b-85d4-9052a6f6fa39-image+(6).png"
//               alt="kapil_Groups_Logo"
//               class="banner"
//             />
//           </div>

//           <hr style="margin: 0" />
//           <div class="content">
//             <h5 style="font-size: 1rem; font-weight: 500">
//               Dear <span style="font-weight: bold">${name}</span>,
//             </h5>

//             <div style="font-size: 0.8rem">
//               <p style="line-height: 1.4">
//                 You are cordially invited to the Board Meeting on [Date]. Below are the details:
              
//               </p>
            
//               <p><span style="font-weight: bold">Meeting Id :</span></p>
//               <p><span style="font-weight: bold">Members :</span></p>
//               <p>Please mark the meeting date on your calendar to ensure your attendance.</p>
//               <p style="padding-top: 15px;">Warm regards,</p>
//               <p>[Board Meeting Organizer]</p>
//               <p>Kapil Group</p>
//             </div>
//           </div>
//           <div class="footer">
//             <p style="color: white; font-size: 15px; margin: 0">
//               All rights are reserved by Kapil Group
//             </p>
//           </div>
//         </div>
//       </div>
//     has context menu
//   `,
// };

// await transporter.sendMail(mailData);
    
//     res.status(201).send(`${result.insertId}`);
//   } catch (error) {
//     console.error("Error creating Meeting:", error);
//     res.status(500).send("Error creating meeting");
//   }
// };
const CreateMeeting = async (req, res) => {
  try {
    let file = req.file;
    let data = req.body;
    let Query = req.query;

    // Extracting entityId, teamId, and userId from query parameters
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
      } else if (teamId) {
        const team = await Team.findOne({ where: { id: teamId } });
        await createdMeeting.setTeam(team);
      }
    }

    let insertId = result.insertId;
    const member = await db.Meeting.findOne({ where: { id: insertId } });
    let Meetmember = member.dataValues.members;
    let createdby = member.dataValues.createdBy;
    let date = member.dataValues.date;

    let num1 = Number(createdby);
    let Ceatorname = await db.User.findAll({
      attributes: ['name'],
      where: { id: num1 },
      raw: true,
    });
    let Creatorname = Ceatorname.map(entry => entry.name);
    Meetmember.push(num1);
    let num = Number(userId);
    Meetmember.push(num);

    let email = await db.User.findAll({
      attributes: ['email', 'name'],
      where: { id: { [Op.in]: Meetmember } },
      raw: true,
    });

    let emails = email.map(entry => entry.email);
    let names = email.map(entry => entry.name);

    // Send individual emails to each recipient
    for (let i = 0; i < emails.length; i++) {
      const mailData = {
        from: 'nirajkr00024@gmail.com',
        to: emails[i],
        subject: 'Board Meeting Created',
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
                    You are cordially invited to the Board Meeting on ${date}. Below are the details:
                  </p>
                  <p><span style="font-weight: bold">Meeting Id :</span> ${insertId}</p>
                  <p><span style="font-weight: bold">Members :</span> ${names.join(', ')}</p>
                  <p>Please mark the meeting date on your calendar to ensure your attendance.</p>
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

    res.status(201).send(`${result.insertId}`);
  } catch (error) {
    console.error("Error creating Meeting:", error);
    res.status(500).send("Error creating meeting");
  }
};


// const UpdateMeetings = async (req, res) => {
//   try {
//     const { id } = req.params;
//     let data = req.body;
//     let file = req.file;

//     // If a file is uploaded, process it
//     if (file) {
//       try {
//         const result = await uploadToS3(file);
//         data = {
//           image: result.Location,
//           ...data
//         };
//       } catch (fileError) {
//         console.error("Error uploading file to S3:", fileError);
//         return res.status(500).json({ error: "File upload error" });
//       }
//     }

//     // Define the SQL query to update the meeting
//     const updateQuery = `UPDATE Meetings SET ? WHERE id = ?`;

//     // Execute the update query
//     mycon.query(updateQuery, [data, id], async (error, updateResults) => {
//       if (error) {
//         console.error("Error updating Meeting:", error);
//         return res.status(500).json({ error: "Internal Server Error" });
//       }

//       // Find the updated meeting and related users
//       try {
//         const member = await db.Meeting.findOne({ where: { id } });
//         if (!member) {
//           return res.status(404).json({ error: "Meeting not found" });
//         }

//         let meetMembers = member.dataValues.members;
//         const userId = member.dataValues.UserId;
//         const createdBy = member.dataValues.createdBy;
//         const num2 = Number(createdBy);

//         let date = member.dataValues.date;

//         let Ceatorname = await db.User.findAll({
//           attributes: ['name'],
//           where: { id: num2 },
//           raw: true,
//         });
//         let Creatorname = Ceatorname.map(entry => entry.name);


//         // Convert userId to a number and add to meetMembers
//         const num = Number(userId);
//         if (!meetMembers.includes(num)) {
//           meetMembers.push(num);
//         }
        

//         // Fetch emails of the members
//         const emailResults = await db.User.findAll({
//           attributes: ['email'],
//           where: { id: { [Op.in]: meetMembers } },
//           raw: true
//         });

//         let emails = emailResults.map(entry => entry.email);
//         let names = emailResults.map(entry => entry.name);
    
//         // Send individual emails to each recipient
//         for (let i = 0; i < emails.length; i++) {
//           const mailData = {
//             from: 'nirajkr00024@gmail.com',
//             to: emails[i],
//             subject: 'Board Meeting Created',
//             html: `
//               <style>
//                 .container {
//                   max-width: 700px;
//                   margin: 0 auto;
//                   padding: 24px 0;
//                   font-family: "Poppins", sans-serif;
//                   background-color: rgb(231 229 228);
//                   border-radius: 1%;
//                 }
//                 .banner {
//                   margin-bottom: 10px;
//                   width: 90px;
//                   height: 8vh;
//                   margin-right: 20px;
//                 }
//                 .header {
//                   display: flex;
//                   align-items: center;
//                   justify-content:center;
//                   padding-top: 10px;
//                 }
//                 p {
//                   margin-bottom: 15px;
//                 }
//                 .container-main {
//                   max-width: 650px;
//                   margin: 0 auto;
//                   font-family: "serif", sans-serif;
//                   background-color: #fafafa;
//                   border-radius: 1%;
//                 }
//                 .content {
//                   padding: 25px;
//                 }
//                 .footer {
//                   background-color: rgb(249 115 22);
//                   padding: 0.5em;
//                   text-align: center;
//                 }
//               </style>
//               <div class="container">
//                 <div class="container-main">
//                   <div class="header">
//                     <img
//                       src="https://upload-from-node.s3.ap-south-1.amazonaws.com/b66dcf3d-b7e7-4e5b-85d4-9052a6f6fa39-image+(6).png"
//                       alt="kapil_Groups_Logo"
//                       class="banner"
//                     />
//                   </div>
//                   <hr style="margin: 0" />
//                   <div class="content">
//                     <h5 style="font-size: 1rem; font-weight: 500">
//                       Dear <span style="font-weight: bold">${names[i]}</span>,
//                     </h5>
//                     <div style="font-size: 0.8rem">
//                       <p style="line-height: 1.4">
//                         You are cordially invited to the Board Meeting on ${date}. Below are the details:
//                       </p>
//                       <p><span style="font-weight: bold">Meeting Id :</span> ${id}</p>
//                       <p><span style="font-weight: bold">Members :</span> ${names.join(', ')}</p>
//                       <p>Please mark the meeting date on your calendar to ensure your attendance.</p>
//                       <p style="padding-top: 15px;">Warm regards,</p>
//                       <p>${Creatorname}</p>
//                       <p>Kapil Group</p>
//                     </div>
//                   </div>
//                   <div class="footer">
//                     <p style="color: white; font-size: 15px; margin: 0">
//                       All rights are reserved by Kapil Group
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             `,
//           };
    
//           await transporter.sendMail(mailData);
//         }
    
//         res.status(201).send(`${id}`);
//       } catch (dbError) {
//         console.error("Error fetching meeting or users:", dbError);
//         return res.status(500).json({ error: "Internal Server Error" });
//       }
//     });
//   } catch (error) {
//     console.error("Unexpected error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

const UpdateMeetings = async (req, res) => {
  try {
    const { id } = req.params;
    let data = req.body;
    let file = req.file;

    // If a file is uploaded, process it
    if (file) {
      try {
        const result = await uploadToS3(file);
        data = {
          image: result.Location,
          ...data,
        };
      } catch (fileError) {
        console.error("Error uploading file to S3:", fileError);
        return res.status(500).json({ error: "File upload error" });
      }
    }

    // Define the SQL query to update the meeting
    const updateQuery = `UPDATE Meetings SET ? WHERE id = ?`;

    // Execute the update query
    mycon.query(updateQuery, [data, id], async (error, updateResults) => {
      if (error) {
        console.error("Error updating Meeting:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      // Find the updated meeting and related users
      try {
        const member = await db.Meeting.findOne({ where: { id } });
        if (!member) {
          return res.status(404).json({ error: "Meeting not found" });
        }

        let meetMembers = member.dataValues.members;
        const userId = member.dataValues.UserId;
        const createdBy = member.dataValues.createdBy;
        const meetingDate = member.dataValues.date;

        // Convert userId and createdBy to numbers
        const numUserId = Number(userId);
        const numCreatedBy = Number(createdBy);

        // Add userId to meetMembers if not already present
        if (!meetMembers.includes(numUserId)) {
          meetMembers.push(numUserId);
        }

        // Fetch creator's name
        const creator = await db.User.findOne({
          attributes: ['name'],
          where: { id: numCreatedBy },
          raw: true,
        });

        if (!creator) {
          return res.status(404).json({ error: "Creator not found" });
        }

        const creatorName = creator.name;

        // Fetch emails and names of the members
        const emailResults = await db.User.findAll({
          attributes: ['email', 'name'],
          where: { id: { [Op.in]: meetMembers } },
          raw: true,
        });

        const emails = emailResults.map(entry => entry.email);
        const names = emailResults.map(entry => entry.name);

        // Send individual emails to each recipient
        for (let i = 0; i < emails.length; i++) {
          const mailData = {
            from: 'nirajkr00024@gmail.com',
            to: emails[i],
            subject: 'Board Meeting Update',
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
                        We regret to inform you that the Board Meeting on ${meetingDate} have been updated. Below are the updated details:
                      </p>
                      <p><span style="font-weight: bold">Meeting Id :</span> ${id}</p>
                      <p><span style="font-weight: bold">Members :</span> ${names.join(', ')}</p>
                      <p>Kindly update your calendar to reflect the new meeting date.</p>
              <p>Thank you for your understanding.</p>
              <p style="padding-top: 10px;">Warm regards,</p>
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

        res.status(201).send(`${id}`);
      } catch (dbError) {
        console.error("Error fetching meeting or users:", dbError);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    });
  } catch (error) {
    console.error("Unexpected error:", error);
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


const GetById = async (req, res) => {
  try {
    // Step 1: Fetch the meeting by its ID
    const meeting = await Meet.findOne({
      where: { id: req.params.id },
    });
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

  
    let members = meeting.members;
    const memberIds = Array.isArray(members) ? members : [];

    let users = [];
    if (memberIds.length > 0) {
      users = await db.User.findAll({
        attributes: ['id', 'image', 'name', 'email', 'entityname'],
        where: {
          id: {
            [Op.in]: memberIds,
          },
        },
      });
    }

    let entityUsers = [];
    if (meeting.EntityId) {
      entityUsers = await db.User.findAll({
        attributes: ['id', 'image', 'name', 'email', 'entityname'],
        where: {
          entityname: meeting.EntityId,
        },
      });
    }

    let userById = null;
    if (meeting.UserId) {
      userById = await db.User.findOne({
        attributes: ['id', 'image', 'name', 'email', 'entityname'],
        where: {
          id: meeting.UserId,
        },
      });
    }

    let teamUsers = [];
    if (meeting.TeamId) {
      const team = await db.Team.findOne({
        where: { id: meeting.TeamId },
      });

      if (team && Array.isArray(team.members)) {
        teamUsers = await db.User.findAll({
          attributes: ['id', 'image', 'name', 'email', 'entityname'],
          where: {
            id: {
              [Op.in]: team.members,
            },
          },
        });
      }
    }

    const allMembers = [
      ...entityUsers,
      ...(userById ? [userById] : []),
      ...teamUsers,
      ...users,
    ];

    const allMembersUnique = Array.from(
      new Set(allMembers.map((user) => user.id))
    ).map((id) => allMembers.find((user) => user.id === id));

    const updatedMeeting = {
      ...meeting.toJSON(),
      members: users,
      allMembers: allMembersUnique,
    };

    res.status(200).json(updatedMeeting);
  } catch (error) {
    console.error('Error fetching meeting details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// revarted code 
// const ListMeetings = async (req, res) => {
//   const { userId } = req.user;
//   console.log("working on this ", userId)

//   const { search = '', page = 1, pageSize = 5, sortBy = 'id DESC', ...restQueries } = req.query;
//   const filters = {};
//   for (const key in restQueries) {
//       filters[key] = restQueries[key];
//   }

//   const offset = (parseInt(page) - 1) * parseInt(pageSize);

//   const accessdata = await db.UserAccess.findOne({ where: { user_id: userId } });
//   const Data = await db.User.findOne({ where: { id: userId } });
//   let EntityId =Data.EntityId

//   // console.log(accessdata?.user_id ?? null, accessdata?.entity_id ?? null, accessdata?.selected_users ?? null, "accessdata", accessdata)

//   // MySQL query to fetch paginated entities
//   let sql;

//   if (!!accessdata && !accessdata.selected_users && !accessdata.entity_id) {
//     // console.log("hello _ 1")
//       sql = `SELECT * FROM Meetings WHERE (meetingnumber LIKE '%${search}%')`
//   } else if (!!accessdata && !accessdata.selected_users && accessdata.entity_id) {
//     // console.log("hello _ 2")
//       let entityIds = [...JSON.parse(accessdata.entity_id), EntityId]
//       // console.log(entityIds, typeof (entityIds), "entityIds")
//       sql = `SELECT * FROM Meetings WHERE (meetingnumber LIKE '%${search}%') AND id IN (${entityIds.join(',')})`;
//     } 
//     else if (!!accessdata && accessdata.selected_users && !accessdata.entity_id) {
//       // console.log("hello _ 3", accessdata.selected_users)
//       //get array of user entity ids
//       // userEntityIds = [56]
//       const users = await db.User.findAll({
//         attributes: ['EntityId'], // Only fetch the entityId column
//         where: {
//           id: [...JSON.parse(accessdata.selected_users)] // Filter users based on userIds array
//         },
//         raw: true // Get raw data instead of Sequelize model instances
//       });
//       const entityIds = users.map(user => user.EntityId);
//       // console.log(entityIds,"ndcnwocbowbcowboubwou beowubobwobwow")
//       sql = `SELECT * FROM Meetings WHERE (meetingnumber LIKE '%${search}%') AND id IN (${entityIds.join(',')})`;
//       // sql = `SELECT * FROM Entities WHERE (name LIKE '%${search}%')`
//   } 
//   else if (!accessdata) {
//     // console.log("hello _ 4")
//       sql = `SELECT * FROM Meetings WHERE UserId = '${userId}'`;
//   }

//   // Add conditions for additional filter fields
//   for (const [field, value] of Object.entries(filters)) {
//       if (value !== '') {
//           sql += ` AND ${field} LIKE '%${value}%'`; // Add the condition
//       }
//   }

//   // Add LIMIT and OFFSET clauses to the SQL query
//   sql += ` ORDER BY ${sortBy} LIMIT ? OFFSET ?`;

//   mycon.query(sql, [parseInt(pageSize), offset], (err, result) => {
//       if (err) {
//           console.error('Error executing MySQL query: ' + err.stack);
//           res.status(500).json({ error: 'Internal server error' });
//           return;
//       }
//       console.log(result,"dwffqf")

//       // Execute the count query to get the total number of entities
//       let sqlCount;
//       if (!!accessdata && !accessdata.selected_users && !accessdata.entity_id) {
//         // console.log("first _ 1")
//           sqlCount = `SELECT COUNT(*) as total FROM Meetings WHERE (meetingnumber LIKE '%${search}%')`;
//       } else if (!!accessdata && !accessdata.selected_users && accessdata.entity_id) {
//         // console.log("first _ 2")
//           let entityIds = [...JSON.parse(accessdata.entity_id), EntityId]
//           // console.log(entityIds, "entityIds")
//           sqlCount = `SELECT COUNT(*) as total FROM Meetings WHERE (meetingnumber LIKE '%${search}%') AND id IN (${entityIds.join(',')})`;
//       } 
//       else if (!!accessdata && accessdata.selected_users && !accessdata.entity_id) {
//         // console.log("first _ 3")
//         //get array of user entity ids
//         userEntityIds = [81]
//         sqlCount = `SELECT COUNT(*) as total FROM Meetings WHERE (meetingnumber LIKE '%${search}%') AND id IN (${userEntityIds.join(',')})`;
//         // sqlCount = `SELECT COUNT(*) as total FROM Entities WHERE (name LIKE '%${search}%')`
//     }
//        else if (!accessdata) {
//         // console.log("first _ 4")
//           sqlCount = `SELECT COUNT(*) as total FROM Meetings WHERE UserId = '${userId}'`;
//       }

//       // Add conditions for additional filter fields
//       for (const [field, value] of Object.entries(filters)) {
//           if (value !== '') {
//               sqlCount += ` AND ${field} LIKE '%${value}%'`;
//           }
//       }

//       mycon.query(sqlCount, async (err, countResult) => {
//           if (err) {
//               console.error('Error executing MySQL count query: ' + err.stack);
//               res.status(500).json({ error: 'Internal server error' });
//               return;
//           }

//           const totalEntities = countResult[0].total;
//           const totalPages = Math.ceil(totalEntities / pageSize);

//           res.json({
//               Meetings: result,
//               totalPages: parseInt(totalPages),
//               currentPage: parseInt(page),
//               pageSize: parseInt(pageSize),
//               totalMeeting: parseInt(totalEntities),
//               startMeeting: parseInt(offset) + 1, // Correct the start entity index
//               endMeeting: parseInt(offset) + parseInt(pageSize), // Correct the end entity index
//               search
//           });
//       });
//   });
// };

// const ListMeetings = async (req, res) => {
//   const { search = '', page = 1, pageSize = 5, sortBy = 'createdAt', ...restQueries } = req.query;
//   const filters = {};
//   for (const key in restQueries) {
//     filters[key] = restQueries[key];
//   }
//   const offset = (parseInt(page) - 1) * parseInt(pageSize);

//   // MySQL query to fetch paginated meetings
//   let sql = `SELECT * FROM Meetings WHERE (meetingnumber LIKE '%${search}%')`;

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

//     // Execute the count query to get the total number of meetings
//     let sqlCount = `SELECT COUNT(*) as total FROM Meetings WHERE (meetingnumber LIKE '%${search}%')`;

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

//       const totalMeetings = countResult[0].total;
//       const totalPages = Math.ceil(totalMeetings / pageSize);

//       res.json({
//         Meetings: result,
//         totalPages: parseInt(totalPages),
//         currentPage: parseInt(page),
//         pageSize: parseInt(pageSize),
//         totalMeetings: parseInt(totalMeetings),
//         startMeeting: parseInt(offset) + 1, // Correct the start meeting index
//         endMeeting: parseInt(offset) + parseInt(pageSize), // Correct the end meeting index
//         search
//       });
//     });
//   });
// };


//revarted
// const GetMeeting = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page, 10) || 1;
//     const pageSize = parseInt(req.query.pageSize, 10) || 10;
//     const sortBy = req.query.sortBy || 'createdAt'; // Default sorting by createdAt if not provided
//     const searchQuery = req.query.search || '';
//     const startDate = req.query.startDate;
//     const endDate = req.query.endDate;

//     // Initialize the options object
//     const options = {
//       offset: (page - 1) * pageSize,
//       limit: pageSize,
//       order: [[sortBy]],
//       where: {}
//     };

//     // Add search filters
//     if (searchQuery) {
//       options.where[Op.or] = [
//         { meetingnumber: { [Op.like]: `%${searchQuery}%` } },
//         { description: { [Op.like]: `%${searchQuery}%` } }
//       ];
//     }

//     // Add date range filters
//     if (startDate && endDate) {
//       options.where.date = {
//         [Op.between]: [new Date(startDate), new Date(endDate)]
//       };
//     }

//     // Add other filters dynamically from the query parameters
//     const filterFields = ['entityId', 'teamId', 'userId'];
//     filterFields.forEach(field => {
//       if (req.query[field]) {
//         const dbField = field.charAt(0).toUpperCase() + field.slice(1); // Assuming model fields are EntityId, TeamId, UserId
//         options.where[dbField] = req.query[field];
//       }
//     });

//     // Extract additional dynamic filters if any
//     Object.keys(req.query).forEach(key => {
//       if (!['page', 'pageSize', 'sortBy', 'search', 'startDate', 'endDate', ...filterFields].includes(key)) {
//         options.where[key] = req.query[key];
//       }
//     });

//     const { count, rows: Meetings } = await db.Meeting.findAndCountAll(options);

//     // Calculate the range of meetings being displayed
//     const startMeeting = (page - 1) * pageSize + 1;
//     const endMeeting = Math.min(page * pageSize, count);

//     const totalPages = Math.ceil(count / pageSize);

//     // Get task counts for each meeting
//     for (let meeting of Meetings) {
//       const [totalTaskCount, overDueCount, completedCount, inProgressCount, toDoCount] = await Promise.all([
//         db.Task.count({ where: { meetingId: meeting.id } }),
//         db.Task.count({ where: { meetingId: meeting.id, status: 'Over-Due' } }),
//         db.Task.count({ where: { meetingId: meeting.id, status: 'Completed' } }),
//         db.Task.count({ where: { meetingId: meeting.id, status: 'In-Progress' } }),
//         db.Task.count({ where: { meetingId: meeting.id, status: 'To-Do' } })
//       ]);

//       meeting.setDataValue('taskCounts', {
//         totalTaskCount,
//         overDueCount,
//         completedCount,
//         inProgressCount,
//         toDoCount
//       });
//     }

//     res.status(200).json({
//       Meetings: Meetings,
//       totalMeetings: count,
//       totalPages: totalPages,
//       currentPage: page,
//       pageSize: pageSize,
//       startMeeting: startMeeting,
//       endMeeting: endMeeting,
//       search: searchQuery
//     });
//   } catch (error) {
//     console.error("Error fetching Meetings:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };


// old and working code
// const GetMeeting = async (req, res) => {
//   console.log(req.query.user, "I am from Quarry");

//   try {
//     const page = parseInt(req.query.page, 10) || 1;
//     const pageSize = parseInt(req.query.pageSize, 10) || 10;
//     const sortBy = req.query.sortBy || 'createdAt'; // Default sorting by createdAt if not provided
//     const searchQuery = req.query.search || '';
//     const entityId = req.query.entity;
//     const teamId = req.query.team;
//     const userId = req.query.user;
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

//     // Modify the search condition based on meetingnumber
//     if (searchQuery) {
//       const meetingNumberSearch = { meetingnumber: { [Op.like]: `%${searchQuery}%` } };
//       options.where = {
//         [Op.and]: [
//           options.where,
//           { [Op.or]: [meetingNumberSearch, { description: { [Op.like]: `%${searchQuery}%` } }] }
//         ]
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
    
    

//     const { count, rows: Meetings } = await db.Meeting.findAndCountAll(options);

//     // Calculate the range of meetings being displayed
//     const startMeeting = (page - 1) * pageSize + 1;
//     const endMeeting = Math.min(page * pageSize, count);

//     const totalPages = Math.ceil(count / pageSize);

//     // Get task counts for each meeting
//     for (let meeting of Meetings) {
//       const [totalTaskCount, overDueCount, completedCount, inProgressCount, toDoCount] = await Promise.all([
//         db.Task.count({ where: { meetingId: meeting.id } }),
//         db.Task.count({ where: { meetingId: meeting.id, stat: 'Over-Due' } }),
//         db.Task.count({ where: { meetingId: meeting.id, status: 'Completed' } }),
//         db.Task.count({ where: { meetingId: meeting.id, status: 'In-Progress' } }),
//         db.Task.count({ where: { meetingId: meeting.id, status: 'To-Do' } })
//       ]);

//       meeting.setDataValue('taskCounts', {
//         totalTaskCount,
//         overDueCount,
//         completedCount,
//         inProgressCount,
//         toDoCount
//       });
//     }

//     res.status(200).json({
//       Meetings: Meetings,
//       totalMeetings: count,
//       totalPages: totalPages,
//       currentPage: page,
//       pageSize: pageSize,
//       startMeeting: startMeeting,
//       endMeeting: endMeeting,
//       search: searchQuery
//     });
//   } catch (error) {
//     console.error("Error fetching Meetings:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };



const GetMeeting = async (req, res) => {
  console.log(req.query.user, "I am from Quarry");

  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const sortBy = req.query.sortBy || 'createdAt'; // Default sorting by createdAt if not provided
    const searchQuery = req.query.search || '';
    const entityId = req.query.entity;
    const teamId = req.query.team;
    const userId = req.query.user;

    const options = {
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [[sortBy]],
      where: {
        [Op.or]: [
          { meetingnumber: { [Op.like]: `%${searchQuery}%` } },
          { description: { [Op.like]: `%${searchQuery}%` } },
        ],
      },
    };

    if (entityId) {
      options.where.EntityId = entityId;
    }
    if (teamId) {
      options.where.TeamId = teamId;
    }
    if (userId) {
      options.where.UserId = userId;
    }

    if (req.meetingmembers) {
      const meetingMembersIds = req.meetingmembers.map(meet => meet.id);
      console.log("Authorized Task IDs:", meetingMembersIds);
      options.where.id = { [Op.in]: meetingMembersIds };
    } else {
      console.log("No authorized tasks found in req.tasks");
      return res.status(403).json({ error: 'Unauthorized access to tasks' });
    }

    const { count, rows: Meetings } = await db.Meeting.findAndCountAll(options);

    const startMeeting = (page - 1) * pageSize + 1;
    const endMeeting = Math.min(page * pageSize, count);
    const totalPages = Math.ceil(count / pageSize);

    for (let meeting of Meetings) {
      const [totalTaskCount, overDueCount, completedCount, inProgressCount, toDoCount] = await Promise.all([
        db.Task.count({ where: { meetingId: meeting.id } }),
        db.Task.count({ where: { meetingId: meeting.id, status: 'Over-Due' } }),
        db.Task.count({ where: { meetingId: meeting.id, status: 'Completed' } }),
        db.Task.count({ where: { meetingId: meeting.id, status: 'In-Progress' } }),
        db.Task.count({ where: { meetingId: meeting.id, status: 'To-Do' } })
      ]);

      meeting.setDataValue('taskCounts', {
        totalTaskCount,
        overDueCount,
        completedCount,
        inProgressCount,
        toDoCount
      });
    }

    res.status(200).json({
      Meetings,
      totalMeetings: count,
      totalPages,
      currentPage: page,
      pageSize,
      startMeeting,
      endMeeting,
      search: searchQuery
    });
  } catch (error) {
    console.error("Error fetching Meetings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};




// const GetMeeting = async (req, res) => {
//   // console.log(req.query.user, "I am from Quarry");

//   try {
//     const page = parseInt(req.query.page, 10) || 1;
//     const pageSize = parseInt(req.query.pageSize, 10) || 10;
//     const sortBy = req.query.sortBy || 'createdAt'; // Default sorting by createdAt if not provided
//     const searchQuery = req.query.search || '';
//     const entityId = req.query.entity;
//     const teamId = req.query.team;
//     const userIdd = req.query.user;
//     const userId = req.user.userId;
//     console.log("userId", userId)
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

//     // Modify the search condition based on meetingnumber
//     if (searchQuery) {
//       const meetingNumberSearch = { meetingnumber: { [Op.like]: `%${searchQuery}%` } };
//       options.where = {
//         [Op.and]: [
//           options.where,
//           { [Op.or]: [meetingNumberSearch, { description: { [Op.like]: `%${searchQuery}%` } }] }
//         ] 
//       };
//     }

//     if (entityId) {
//       options.where.EntityId = entityId;
//     }
//     if (teamId) {
//       options.where.TeamId = teamId;
//     }
    
    
  
//     const members = db.sequelize.where(
//       db.sequelize.fn('JSON_CONTAINS', db.sequelize.col('members'), JSON.stringify(userId)),
//       true
//     );
    
    
//     // where.createdBy = userId;
//     // where.UserId = userId;
    

    
//     const createdBycondition = { createdBy: userId}
    

//     const { count, rows: Meetings } = await db.Meeting.findAndCountAll({
//       where: { ...createdBycondition },
//       ...options,
//       ...members
//     });

    

//     // Calculate the range of meetings being displayed
//     const startMeeting = (page - 1) * pageSize + 1;
//     const endMeeting = Math.min(page * pageSize, count);

//     const totalPages = Math.ceil(count / pageSize);

//     // Get task counts for each meeting
//     for (let meeting of Meetings) {
//       const [totalTaskCount, overDueCount, completedCount, inProgressCount, toDoCount] = await Promise.all([
//         db.Task.count({ where: { meetingId: meeting.id } }),
//         db.Task.count({ where: { meetingId: meeting.id, stat: 'Over-Due' } }),
//         db.Task.count({ where: { meetingId: meeting.id, status: 'Completed' } }),
//         db.Task.count({ where: { meetingId: meeting.id, status: 'In-Progress' } }),
//         db.Task.count({ where: { meetingId: meeting.id, status: 'To-Do' } })
//       ]);

//       meeting.setDataValue('taskCounts', {
//         totalTaskCount,
//         overDueCount,
//         completedCount,
//         inProgressCount,
//         toDoCount
//       });
//     }

//     res.status(200).json({
//       Meetings: Meetings,
//       totalMeetings: count,
//       totalPages: totalPages,
//       currentPage: page,
//       pageSize: pageSize,
//       startMeeting: startMeeting,
//       endMeeting: endMeeting,
//       search: searchQuery
//     });
//   } catch (error) {
//     console.error("Error fetching Meetings:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };









module.exports = {
  CreateMeeting,
  // ListMeetings,
  GetMeeting,
  UpdateMeetings,
  DeleteMeeting,
  // ListEntiyGroup,
  // ListTeamGroup,
  // ListUserGroup,
  GetById
};
