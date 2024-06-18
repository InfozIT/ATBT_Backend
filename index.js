const express = require('express')
const { Sequelize } = require('sequelize');
const { Op } = require('sequelize');


require('dotenv').config();
const mycon = require('./DB/mycon')

var db = require('./models/index');


const cron = require('cron');

const bodyParser = require('body-parser')
const cors = require('cors')
const transporter = require('./utils/nodemailer')

const path = require('path');
const upload = require('./utils/store')
const {uploadToS4}= require('./utils/wearhouse');  // for s3
const nodemailer = require('nodemailer');

// const multer = require('multer');
// const cron = require('node-cron');



require('./models')
const Entite_router = require('./Routes/Entity')
const DataShairing_router = require('./Routes/Acces')
const Toggle = require('./Controllers/toggle')
const emailRoute = require('./mail/mail')
const Auth_router = require('./Routes/Auth')
const User_router = require('./Routes/User')
const Role_router = require('./Routes/Role')
const Public_router = require('./Routes/Public')
const Task_router = require('./Routes/Task')
const Team_router = require('./Routes/Team')
const Meeting_router = require('./Routes/Meeting')
const Reports_router = require('./Routes/reports')
const CreateForm_router = require("./Routes/CreateForm")
const errorHander = require('./middlewares/errorHandler.middleware')
const routeNotFound = require('./middlewares/routeNotfound.middleware')
const authVerify = require('./middlewares/authVerify.middleware')

const app = express()
const port = 3000;


app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/entity', authVerify, Entite_router);
app.use('/user', authVerify, User_router);
// app.use('/entity',Entite_router);
// app.use('/user', User_router);
app.use('/team', authVerify, Team_router);
app.use('/auth', Auth_router);
app.use('/access', DataShairing_router);
app.use('/report', authVerify, Reports_router);

app.use('/form', CreateForm_router);
app.use('/boardmeeting', authVerify, Meeting_router);
app.use('/rbac', Role_router);
app.use('/public', Public_router);
app.use('/api', authVerify, emailRoute);
app.use('/task',authVerify, Task_router);



//load Static file
const imagesFolder = path.join(__dirname, 'Public');
app.use('/images', express.static(imagesFolder));


app.post("/upload", upload.single("files"), async (req, res) => {
  if (req.file) {
  let result = await uploadToS4(req.file,req.body)
  res.status(201).send(result.Location);
  }
});

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Updates</title>
      </head>
      <body>
        <h1>Join DB</h1>
        <h2>Fix: pageSize</h2>
        <ul>
          <li>
          get data with join table
          </li>
          <li>
          implement joins dynamically
          </li>
          <li>
          Added pool connection to db aux
          </li>
          <li>
          modified search as per id in BM
          </li>
          <li>
          fix pulic boardmeeting spell.
          </li>
          <li>
          fix entity name 412024.
          </li>
          <li>
          feat... Entity & Meeting (members) joined 412024. </br>
          GET  https://atbtbeta.infozit.com/team/add </br>
          GET  https://atbtbeta.infozit.com/task/entity/group/40 </br>
          GET  https://atbtbeta.infozit.com/task/team/group/41 </br>
          POST https://atbtbeta.infozit.com/boardmeeting/add?entity=7 </br>
          </li>
          <li>
          added entity id.
          </li>
          <li>
          filterd data only for users list based on data sharing.
          </li>
          <li>
          fix user list
          </li>
          <li>
          dynamic data sharing
          </li>
          <li>
          dynamic data sharing user & entity lcbi
          </li>
          <li>
          board meeting done
          </li>
          <li>                <p> 1. User Created </p>

          <p> 2. User Details Updated </p>
          
         <p>3. Password Change </p>
          
          <p> 4. Forget Password </p>
          
         <p> 5. Board Meeting Created </p>
          
          <p> 6. Board Meeting Updated </p>
          </li>
        </ul>
      </body>
    </html>
  `);
});
// toggle 
app.put('/toggle/:id', Toggle.Add_toggle)
app.use(errorHander);
app.use(routeNotFound);




// bord meeting remainder 
const isLessThan24HoursAway = (dateString) => {
  const now = new Date();
  const targetDate = new Date(dateString);
  const diff = targetDate - now;
  const hoursDiff = diff / (1000 * 60 * 60); // Convert milliseconds to hours
  return hoursDiff < 24;
};

// Create a cron job to run every minute
const task = new cron.CronJob('0 10 * * *', function() {
  mycon.query('SELECT * FROM Meetings', (err, result) => {
    if (err) {
      console.error('Error retrieving data: ' + err.stack);
      // Handle the error here
      return;
    }

    // Get the dates that are less than 24 hours away
    const dateless = result.filter(entry => isLessThan24HoursAway(entry.date)).map(entry => entry.date);

    if (dateless.length > 0) {
      // Perform the query with the filtered dates
      mycon.query('SELECT members, createdBy FROM Meetings WHERE date IN (?)', [dateless], (err, result) => {
        if (err) {
          console.error('Error retrieving data: ' + err.stack);
          return;
        }
        
        // Collect members and createdBy values
        let meetMembers = [];
        result.forEach(entry => {
          if (Array.isArray(entry.members)) {
            meetMembers = meetMembers.concat(entry.members);
          }
          const createdByNum = Number(entry.createdBy);
          if (!Number.isNaN(createdByNum)) {
            meetMembers.push(createdByNum);
          }
        });

        // Remove duplicates
        const uniqueIds = [...new Set(meetMembers)];

        // Query Users table with the collected IDs
        mycon.query('SELECT email FROM Users WHERE id IN (?)', [uniqueIds], (err, result) => {
          if (err) {
            console.error('Error retrieving data: ' + err.stack);
            return;
          }
          const emails = result.map(entry => entry.email);
          const mailData = {
            from: 'nirajkr00024@gmail.com',
            to: emails,
            subject: 'Board meeting Remainder',
            html: `
              <style>
                .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f9f9f9; }
                .banner { margin-bottom: 20px; }
                .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; }
                .button:hover { background-color: #0056b3; }
                p { margin-bottom: 15px; }
              </style>
              <div class="container">
                <p>Hi there,</p>
                <img src="https://atbtmain.teksacademy.com/images/logo.png" alt="Infoz IT logo" class="banner" />
                <p>The board meeting has been updated. Please check the details on the platform.</p>
                <p>If you have any questions, please contact us.</p>
                <p>Thank you,</p>
                <p>Infoz IT Team</p>
              </div>
            `,
          };
  
        transporter.sendMail(mailData);
        });
      });
    } else {
      console.log('No dates less than 24 hours away');
    }
  });
});

// Start the cron job
task.start();

const task2 = new cron.CronJob('*/2 * * * *', async function() {
  mycon.query('SELECT * FROM Tasks WHERE status = "Completed" AND emailSent = FALSE', async (err, result) => {
    if (err) {
      console.error('Error retrieving data: ' + err.stack);
      return;
    }

    for (const entry of result) {
      let status = entry.status;
      let dueDate = entry.dueDate;
      let PR = entry.members;

      try {
        let creator = await db.User.findOne({
          attributes: ['name'],
          where: { id: PR }, 
          raw: true,
        });
        let PersonResponseible = creator.name;
        let decision = entry.decision;
        let meetingId = entry.meetingId;
        let colab = entry.collaborators;
        let meetMembers = colab.concat(PR);

        mycon.query('SELECT meetingnumber, date FROM Meetings WHERE id = ?', [meetingId], (err, result) => {
          if (err) {
            console.error('Error retrieving meeting data: ' + err.stack);
            return;
          }

          if (result.length === 0) {
            console.error('No meeting found with ID: ' + meetingId);
            return;
          }

          let Meetdate = result[0].date;
          let MeetNo = result[0].meetingnumber;

          let uniqueIds = [...new Set(meetMembers)]; // Ensure unique IDs

          mycon.query('SELECT email, name FROM Users WHERE id IN (?)', [uniqueIds], (err, result) => {
            if (err) {
              console.error('Error retrieving user emails: ' + err.stack);
              return;
            }

            const emails = result.map(entry => entry.email);
            const names = result.map(entry => entry.name);

            for (let i = 0; i < emails.length; i++) {
              const mailData = {
                from: 'nirajkr00024@gmail.com',
                to: emails[i],
                subject: `Decision Update: Marked Complete by ${PersonResponseible} `,
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
                       table {
               border-collapse: collapse;
               width: 100%;
               margin-top: 10px;
             }
             th, td {
               border: 1px solid black;
               padding: 8px;
               text-align: left;
             }
             tr:nth-child(even) {
               background-color: #f2f2f2;
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
                            We wanted to inform you that ${PersonResponseible} has marked a decision taken during Meeting Number:<span style="font-weight:bold">${MeetNo}</span> on ${Meetdate} as completed.
                          </p>
                          <p>Here are the details:</p>
                          <table>
                            <thead>
                              <th>Decision Taken</th>
                              <th>Due Date</th>
                              <th>Decision Status</th>
                            </thead>
                            <tbody>
                              <tr>
                                <td style="width:"400px">${decision}</td>
                                <td>${dueDate}</td>
                                <td>${status}</td>
                              </tr>
                            </tbody>
                          </table>

                      <a
                      href= "https://www.betaatbt.infozit.com/login" 
                        class="button"
                       
                        style="display: inline-block; padding: 10px 20px; background-color: rgb(249 115 22);
                        color: #fff; text-decoration: none; border-radius: 5px; margin-top:10px"
                        >Login</a
                      >
                          <p style="padding-top: 15px;">Best regards,</p>
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

              transporter.sendMail(mailData, (error, info) => {
                if (error) {
                  return console.error('Error sending email: ' + error.stack);
                }
                console.log('Email sent: ' + info.response);

                // Mark the task as having had an email sent
                mycon.query('UPDATE Tasks SET emailSent = TRUE WHERE id = ?', [entry.id], (err, result) => {
                  if (err) {
                    console.error('Error updating task: ' + err.stack);
                    return;
                  }
                  console.log('Task marked as email sent.');
                });
              });
            }
          });
        });
      } catch (error) {
        console.error('Error retrieving user data: ' + error.stack);
      }
    }
  });
});

task2.start();

const task3 = new cron.CronJob('0 0 * * SUN', async function() {
  mycon.query('SELECT * FROM Tasks WHERE stat = "Over-Due"', async (err, result) => {
    if (err) {
      console.error('Error retrieving data: ' + err.stack);
      return;
    }

    for (const entry of result) {
      let status = entry.stat;
      let dueDate = entry.dueDate;
      let PR = entry.members;

      try {
        let creator = await db.User.findOne({
          attributes: ['name'],
          where: { id: PR }, 
          raw: true,
        });
        let PersonResponseible = creator.name;
        let decision = entry.decision;
        let meetingId = entry.meetingId;
        let colab = entry.collaborators;
        let meetMembers = colab.concat(PR);

        mycon.query('SELECT meetingnumber, date FROM Meetings WHERE id = ?', [meetingId], (err, result) => {
          if (err) {
            console.error('Error retrieving meeting data: ' + err.stack);
            return;
          }

          if (result.length === 0) {
            console.error('No meeting found with ID: ' + meetingId);
            return;
          }

          let Meetdate = result[0].date;
          let MeetNo = result[0].meetingnumber;

          let uniqueIds = [...new Set(meetMembers)]; // Ensure unique IDs

          mycon.query('SELECT email, name FROM Users WHERE id IN (?)', [uniqueIds], (err, result) => {
            if (err) {
              console.error('Error retrieving user emails: ' + err.stack);
              return;
            }

            const emails = result.map(entry => entry.email);
            const names = result.map(entry => entry.name);

            for (let i = 0; i < emails.length; i++) {
              const mailData = {
                from: 'nirajkr00024@gmail.com',
                to: emails[i],
                subject: 'Action Required: Overdue Decisions',
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
                       table {
               border-collapse: collapse;
               width: 100%;
               margin-top: 10px;
             }
             th, td {
               border: 1px solid black;
               padding: 8px;
               text-align: left;
             }
             tr:nth-child(even) {
               background-color: #f2f2f2;
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
                           We're writing to remind you about the decision that are currently overdue. Below is the list
                          </p>
                    
                          <table>
                            <thead>
                              <th>Decision Taken</th>
                              <th>Due Date</th>
                              <th>Decision Status</th>
                            </thead>
                            <tbody>
                              <tr>
                                <td style="width:"400px">${decision}</td>
                                <td>${dueDate}</td>
                                <td>${status}</td>
                              </tr>
                            </tbody>
                          </table>
                                                <a
                      href= "https://www.betaatbt.infozit.com/" 
                        class="button"
                       
                        style="display: inline-block; padding: 10px 20px; background-color: rgb(249 115 22);
                        color: #fff; text-decoration: none; border-radius: 5px; margin-top:10px"
                        >Login</a
                      >



                          <p> Please prioritize completing these decisions at your earlist convenience.</p>
                          <p style="padding-top: 15px;">Best regards,</p>
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

              transporter.sendMail(mailData, (error, info) => {
                if (error) {
                  return console.error('Error sending email: ' + error.stack);
                }
                console.log('Email sent: ' + info.response);

                // Mark the task as having had an email sent
                mycon.query('UPDATE Tasks SET emailSent = TRUE WHERE id = ?', [entry.id], (err, result) => {
                  if (err) {
                    console.error('Error updating task: ' + err.stack);
                    return;
                  }
                  console.log('Task marked as email sent.');
                });
              });
            }
          });
        });
      } catch (error) {
        console.error('Error retrieving user data: ' + error.stack);
      }
    }
  });
});

task3.start();


// Function to check and update Users table
async function checkAndUpdateUsers() {
  try {
    // Fetch users where entityname has been updated
    const users = await db.User.findAll();

    for (const user of users) {
      if (user.entityname !== user.EntityId) {
        user.EntityId = user.entityname;
        await user.save();
      }
    }
  } catch (error) {
    console.error('Error checking and updating users:', error);
  }
}

// Setup cron job to run every second
const task4 = new cron.CronJob('* * * * * *', async function() {
  await checkAndUpdateUsers();
});

task4.start();

































app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
