var db = require('../models/index');
const Meet = db.Meeting;
const mycon = require('../DB/mycon');
const transporter = require('../utils/nodemailer')





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
  console.log(bmId)
  const task = await db.Task.findAll({ where: {meetingId: bmId } });
  res.status(200).json(task);};

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


  
const DeleteTask = async (req, res) => { res.status(201).json({ message: "successfully" });};




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