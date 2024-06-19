var db = require('../models/index');
const Meet = db.Meeting;
const { Sequelize } = require('sequelize');

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

    // Extracting entityId, teamId, and userId from query parameters
    const entityId = Query?.entity ?? null;
    const teamId = Query?.team ?? null;
    const userId = Query?.user ?? null;

    console.log(entityId,"3445678",teamId,"23456789",userId, "2345678")

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
        console.log(entityId,"mail for entity")

        let insertId = result.insertId;
        const member = await db.Meeting.findOne({ where: { id: insertId } });
        let Meetmember = member.dataValues.members;
        let createdby = member.dataValues.createdBy;
        let date = member.dataValues.date;
        let BMno = member.dataValues.meetingnumber;
    
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

        let EntityMember = await db.User.findAll({
          attributes: ['id'],
          where: { entityname: entityId},
          raw: true,
        });
        const ids = EntityMember.map(item => item.id)

        const Final = Meetmember.concat(ids);

        finalMem  = [...new Set(Final)]; // Ensure unique IDs
    
        let email = await db.User.findAll({
          attributes: ['email', 'name'],
          where: { id: { [Op.in]: finalMem } },
          raw: true,
        });
    
        let emails = email.map(entry => entry.email);
        let names = email.map(entry => entry.name);
    
        // Send individual emails to each recipient
        for (let i = 0; i < emails.length; i++) {
          const mailData = {
            from: 'nirajkr00024@gmail.com',
            to: emails[i],
            subject: `Invitation: Board Meeting on ${date}`,
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
                      <p><span style="font-weight: bold">Meeting Id :</span> ${BMno}</p>
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



      } else if (userId) {
        const user = await db.User.findOne({ where: { id: userId } });
        await createdMeeting.setUser(user);
        console.log(userId,"mail for User")
        let insertId = result.insertId;
        const member = await db.Meeting.findOne({ where: { id: insertId } });
        let Meetmember = member.dataValues.members;
        let createdby = member.dataValues.createdBy;
        let date = member.dataValues.date;
        let BMno = member.dataValues.meetingnumber;
    
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
            subject: `Invitation: Board Meeting on ${date}`,
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
                      <p><span style="font-weight: bold">Meeting Id :</span> ${BMno}</p>
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
    


      } else if (teamId) {
        const team = await Team.findOne({ where: { id: teamId } });
        await createdMeeting.setTeam(team);
        console.log(teamId,"mail for Team")
        let insertId = result.insertId;
        const member = await db.Meeting.findOne({ where: { id: insertId } });
        let Meetmember = member.dataValues.members;
        let createdby = member.dataValues.createdBy;
        let date = member.dataValues.date;
        let BMno = member.dataValues.meetingnumber;
    
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

        let TeamMember = await db.Team.findAll({
          attributes: ['members'],
          where: { id: teamId},
          raw: true,
        });

        const ids = TeamMember.map(item => item.members)
        let flattenedArray = ids[0];


        const Final = Meetmember.concat(flattenedArray);

        finalMem  = [...new Set(Final)]; 
    
        let email = await db.User.findAll({
          attributes: ['email', 'name'],
          where: { id: { [Op.in]: finalMem } },
          raw: true,
        });
    
        let emails = email.map(entry => entry.email);
        let names = email.map(entry => entry.name);
    
        // Send individual emails to each recipient
        for (let i = 0; i < emails.length; i++) {
          const mailData = {
            from: 'nirajkr00024@gmail.com',
            to: emails[i],
            subject: `Invitation: Board Meeting on ${date}`,
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
                      <p><span style="font-weight: bold">Meeting Id :</span> ${BMno}</p>
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


      }
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
        let BMno = member.dataValues.meetingnumber;


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
            subject: 'Notice : Board Meeting Updated',
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
                      <p><span style="font-weight: bold">Meeting Id :</span> ${BMno}</p>
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

const PatchMeetings = async (req, res) => {
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
      res.status(201).send(`${id}`);
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


// Current code bala
// const GetMeeting = async (req, res) => {
//   console.log(req.query.user, "I am from ");

//   try {
//     // const page = parseInt(req.query.page, 10) || 1;
//     // const pageSize = parseInt(req.query.pageSize, 10) || 10;
//     // const sortBy = req.query.sortBy || 'createdAt'; // Default sorting by createdAt if not provided
//     // const searchQuery = req.query.search || '';
//     // const entityId = req.query.entity;
//     // const teamId = req.query.team;
//     // const userId = req.query.user;

//     const { searchQuery = '', page = 1, pageSize = 5, sortBy = 'createdAt',entity: entityId, team: teamId, user: userId,  ...restQueries } = req.query;

//     const offset = (parseInt(page) - 1) * parseInt(pageSize);

//     const filters = {};
//     for (const key in restQueries) {
//       filters[key] = restQueries[key];
//     }

//     const whereClause = {
//       [Op.or]: [
//         { meetingnumber: { [Op.like]: `%${searchQuery}%` } },
//         { description: { [Op.like]: `%${searchQuery}%` } }
//       ]
//     }

//     for (const [field, value] of Object.entries(filters)) {
//       if (value !== '') {
//         whereClause[field] = { [Op.like]: `%${value}%` };
//       }
//     }

//     const fromDate = req.query.fromDate;
//     const toDate = req.query.toDate;

//     const options = {
//       offset: offset,
//       limit: parseInt(pageSize),
//       order: [[sortBy]],
//       where: whereClause,
//     };

   
    
//     if (fromDate && toDate) {
//       options.where.date = {
//         [Op.between]: [fromDate, toDate]
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

//     if (req.meetingmembers) {
//       const meetingMembersIds = req.meetingmembers.map(meet => meet.id);
//       console.log("Authorized Task IDs:", meetingMembersIds);
//       options.where.id = { [Op.in]: meetingMembersIds };
//     } else {
//       console.log("No authorized tasks found in req.tasks");
//       return res.status(403).json({ error: 'Unauthorized access to tasks' });
//     }

//     const { count, rows: Meetings } = await db.Meeting.findAndCountAll(options);

    

//     const startMeeting = (page - 1) * pageSize + 1;
//     const endMeeting = Math.min(page * pageSize, count);
//     const totalPages = Math.ceil(count / pageSize);

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

//     const ids = Meetings.map(item => item.id);
//     const placeholders = ids.map(() => '?').join(',');

//     mycon.query(`SELECT * FROM Meetings WHERE id IN (${placeholders})`, ids, (err, resultmy) => {
//       console.log(resultmy)
//       return;
//     })

//           // Merge additional columns
//           const mergedTeams = teamsWithTaskCounts.map(team => {
//             const additionalData = resultMap.get(team.id);
//             if (additionalData) {
//               // Add any new columns from resultmy to the team object
//               for (const key in additionalData) {
//                 if (!team.hasOwnProperty(key)) {
//                   team[key] = additionalData[key];
//                 }
//               }
//             }
//             return team;
//           });


//     res.status(200).json({
//       Meetings,
//       totalMeetings: count,
//       totalPages,
//       currentPage: page,
//       pageSize,
//       startMeeting,
//       endMeeting,
//       search: searchQuery
//     });
//   } catch (error) {
//     console.error("Error fetching Meetings:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };



const GetMeeting = async (req, res) => {
  console.log(req.query.user, "I am from ");

  try {
    const { search = '', page = 1, pageSize = 5, sortBy = 'createdAt', entity: entityId, team: teamId, user: userId, fromDate, toDate, ...restQueries } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const filters = {};
    for (const key in restQueries) {
      filters[key] = restQueries[key];
    }

    const whereClause = {
      [Op.or]: [
        { meetingnumber: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ]
    };

    for (const [field, value] of Object.entries(filters)) {
      if (value !== '') {
        whereClause[field] = { [Op.like]: `%${value}%` };
      }
    }

    const options = {
      offset: offset,
      limit: parseInt(pageSize),
      order: [[sortBy]],
      where: whereClause,
    };

    if (fromDate && toDate) {
      options.where.date = {
        [Op.between]: [fromDate, toDate]
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

    const ids = Meetings.map(item => item.id);
    if (ids.length > 0) {
      const placeholders = ids.map(() => '?').join(',');

      mycon.query(`SELECT * FROM Meetings WHERE id IN (${placeholders})`, ids, (err, resultmy) => {
        if (err) {
          console.error("Error fetching resultmy:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        const resultMap = new Map();
        resultmy.forEach(row => {
          resultMap.set(row.id, row);
        });

        const mergedMeetings = Meetings.map(meeting => {
          const additionalData = resultMap.get(meeting.id);
          if (additionalData) {
            for (const key in additionalData) {
              if (!meeting.dataValues.hasOwnProperty(key)) {
                meeting.setDataValue(key, additionalData[key]);
              }
            }
          }
          return meeting;
        });

        res.status(200).json({
          Meetings: mergedMeetings,
          totalMeetings: count,
          totalPages,
          currentPage: page,
          pageSize,
          startMeeting,
          endMeeting,
          search: search
        });
      });
    } else {
      // No IDs to query, return the meetings as is
      res.status(200).json({
        Meetings,
        totalMeetings: count,
        totalPages,
        currentPage: page,
        pageSize,
        startMeeting,
        endMeeting,
        search: search
      });
    }
  } catch (error) {
    console.error("Error fetching Meetings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};





// const GetMeeting = async (req, res) => {
//   console.log(req.query.user, "I am from Quarry");

//   try {
//     // const page = parseInt(req.query.page, 10) || 1;
//     // const pageSize = parseInt(req.query.pageSize, 10) || 10;
//     // const sortBy = req.query.sortBy || 'createdAt'; // Default sorting by createdAt if not provided
//     // const searchQuery = req.query.search || '';
//     const entityId = req.query.entity;
//     const teamId = req.query.team;
//     const userId = req.query.user;

//     const { searchQuery = '', page = 1, pageSize = 5, sortBy = 'createdAt', ...restQueries } = req.query;

//     const offset = (parseInt(page) - 1) * parseInt(pageSize);

//     const filters = {};
//     for (const key in restQueries) {
//       filters[key] = restQueries[key];
//     }

//     let whereClause = {};
//     // Add additional filters
//     for (const [field, value] of Object.entries(filters)) {
//       if (value !== '') {
//         whereClause[field] = { [Op.like]: `%${value}%` };
//       }
//     }
//     // Split and validate sortBy parameter
    
//     const fromDate = req.query.fromDate;
//     const toDate = req.query.toDate;

//     const options = {
//       // offset: (page - 1) * pageSize,
//       limit: parseInt(pageSize),
//       // order: [[sortBy]],
//       offset,
//       where: {
//         [Op.or]: [
//           { meetingnumber: { [Op.like]: `%${searchQuery}%` } },
//           { description: { [Op.like]: `%${searchQuery}%` } },
//           whereClause
//         ],
        
//       },
//     };

    

//     // // Add date range filter if both fromDate and toDate are provided
//     // if (fromDate && toDate) {
//     //   options.where.date = {
//     //     [Op.and]: [
//     //       { [Op.gte]: new Date(fromDate) }, // greater than or equal to fromDate
//     //       { [Op.lte]: new Date(toDate) }    // less than or equal to toDate
//     //     ]
//     //   };
//     // }

//     if (fromDate && toDate) {
//       options.where.date = {
//         [Op.between]: [fromDate, toDate]
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

//     if (req.meetingmembers) {
//       const meetingMembersIds = req.meetingmembers.map(meet => meet.id);
//       console.log("Authorized Task IDs:", meetingMembersIds);
//       options.where.id = { [Op.in]: meetingMembersIds };
//     } else {
//       console.log("No authorized tasks found in req.tasks");
//       return res.status(403).json({ error: 'Unauthorized access to tasks' });
//     }

//     const { count, rows: Meetings } = await db.Meeting.findAndCountAll(options);

//     const startMeeting = (page - 1) * pageSize + 1;
//     const endMeeting = Math.min(page * pageSize, count);
//     const totalPages = Math.ceil(count / pageSize);

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
//       Meetings,
//       totalMeetings: count,
//       totalPages,
//       currentPage: page,
//       pageSize,
//       startMeeting,
//       endMeeting,
//       search: searchQuery
//     });
//   } catch (error) {
//     console.error("Error fetching Meetings:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };


// post method
const GetMeetingList = async (req, res) => {
  console.log(req.query.user, "I am from Quarry");

  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const sortBy = req.query.sortBy || 'createdAt'; // Default sorting by createdAt if not provided
    const searchQuery = req.query.search || '';
    const entityId = req.query.entity;
    const teamId = req.query.team;
    const userId = req.query.user;

    

    // Extract the rest of the query parameters for dynamic filtering
    const { page: _page, pageSize: _pageSize, sortBy: _sortBy, search: _search, entity: _entity, team: _team, user: _user, ...restQueries } = req.query;

    const options = {
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [[sortBy]],
      where: {
        [Op.or]: [
          { meetingnumber: { [Op.like]: `%${searchQuery}%` } },
          { description: { [Op.like]: `%${searchQuery}%` } },
        ],
        ...restQueries // Add dynamic filters here
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



const getAttachments = async (req, res) => {
  const { TaskId, MeetingId } = req.query;

  try {
    let data;
    if (TaskId) {
      data = await db.Attchments.findAll({
        where: {
          TaskId: TaskId,
        }
      });
    } else if (MeetingId) {
      data = await db.Attchments.findAll({
        where: {
          MeetingId: MeetingId,
        }
      });
    } else {
      data = await db.Attchments.findAll();
    }

    // Remove extra backslashes from "Attchments" field
    const cleanedData = data.map(item => ({
      ...item.dataValues,
      Attchments: item.dataValues.Attchments.replace(/^"|"$/g, '')
    }));

    res.status(200).json(cleanedData);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while retrieving data' });
  }
};






module.exports = {
  CreateMeeting,
  // ListMeetings,
  GetMeeting,
  UpdateMeetings,
  DeleteMeeting,
  GetMeetingList,
  // ListEntiyGroup,
  // ListTeamGroup,
  // ListUserGroup,
  GetById,
  PatchMeetings,
  getAttachments
};
