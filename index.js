const express = require('express')
require('dotenv').config();
const mycon = require('./DB/mycon')

const cron = require('cron');

const bodyParser = require('body-parser')
const cors = require('cors')
const transporter = require('./utils/nodemailer')

const path = require('path');
const upload = require('./utils/store')
const uploadToS3= require('./utils/wearhouse');  // for s3
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

app.use('/form', CreateForm_router);
app.use('/boardmeeting', authVerify, Meeting_router);
app.use('/rbac', Role_router);
app.use('/public', Public_router);
app.use('/api', authVerify, emailRoute);
app.use('/task',authVerify, Task_router);



//load Static file
const imagesFolder = path.join(__dirname, 'Public');
app.use('/images', express.static(imagesFolder));


app.post("/upload", upload.single("image"), async (req, res) => {
  // console.log(req.file);
  if (req.file) {
    await uploadToS3(req.file);
  }

  res.send({
    msg: "Image uploaded succesfully",
  });
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
                <p> 1. User Created

                2. User Details Updated
                
                3. Password Change
                
                4. Forget Password
                
                5. Board Meeting Created
                
                6. Board Meeting Updated
                
                7. Team Created
                
                8. Team Updated
                
                9. Task Assigned to user
                
                10. Task Updated by User
                
                11. Task Completed by User
                
                12. Sub Task Created
                
                13. Reminder – One Day before Board Meeting
                
                14. Reminder – One day before task due date
                
                15. Overdue – One email for a week with the list of overdue tasks </P>
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






























app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
