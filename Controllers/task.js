var db = require('../models/index');
const Meet = db.Meeting;
const mycon = require('../DB/mycon');
const transporter = require('../utils/nodemailer')
const { Op } = require('sequelize');
const Task = require('../models/Task');
const User = require('../models/User');




const CreateTask = async (req, res) => {
  try {
    let file = req.file;
    var data = req.body;
    let collaborators = req.body.collaborators
    let taskCreatedBy = req.body.taskCreatedBy
    let bmId = req.params.id;

    // const CollaboratorsString = JSON.stringify(Collaborators);


    if (file) {
      data = {
        file: `${process.env.IMAGE_URI}/images/${req.file.filename}`,
        ...data
      }
    }
    const task = await db.Task.create({ meetingId: bmId, collaborators : collaborators,taskCreateby:taskCreatedBy  }, data);
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
const GetTask = async (req, res) => {
  const bmId = req.params.id;
  const tasks = await db.Task.findAll({
    where: { meetingId: bmId },
    order: [['createdAt', 'DESC']]
  });
  const meetingIds = tasks.map(item => parseInt(item.meetingId));
  const meetings = await db.Meeting.findAll({
    attributes: ['id', 'date', 'meetingnumber'],
    where: {
      id: meetingIds // Filter meetings based on meetingIds array
    },
    raw: true // Get raw data instead of Sequelize model instances
  });
      const combinedResult = tasks.map(task => {
      const taskData = task.dataValues; // Extracting dataValues from Sequelize object
      const meetingDetails = meetings.find(m => m.id === parseInt(task.meetingId));
      return {
        ...taskData,
        id: taskData.id,
        decision: taskData.decision,
        date: meetingDetails.date,
        meetingnumber: meetingDetails.meetingnumber,
        priority: taskData.priority,
        members: taskData.members,
        dueDate: taskData.dueDate,
        status: taskData.status,
        file: taskData.file,
      };
    });

    res.status(200).json(combinedResult);
};
// VVO

// const GetTaskbyId = async (req, res) => {
//   const taskId = req.params.id;
//   try {
//     // Fetch the task details
//     const tasks = await db.Task.findAll({
//       where: { id: taskId },
//     });

//     // Extracting meetingId from tasks
//     const meetingIds = tasks.map(item => parseInt(item.meetingId));
//     // Fetch the meeting details
//     const meetings = await db.Meeting.findAll({
//       attributes: ['id', 'date', 'meetingnumber'],
//       where: {
//         id: meetingIds // Filter meetings based on meetingIds array
//       },
//       raw: true // Get raw data instead of Sequelize model instances
//     });

//     // Convert taskId to a number
//     const taskIdNum = parseInt(taskId);

//     // Fetch task comments for the given task
//     const taskComments = await db.SubTaskDoc.findAll({
//       where: {
//         TaskId: taskId
//       },
//       raw: true // Get raw data instead of Sequelize model instances
//     });
//     // Extract unique userIds from comments
//     const userIds = [...new Set(taskComments.map(item => parseInt(item.senderId)))];
//     console.log(userIds)

//     // Fetch user details based on userIds
//     const users = await db.User.findAll({
//       attributes: ['id', 'image', 'name'],
//       where: {
//         id: userIds
//       },
//       raw: true // Get raw data instead of Sequelize model instances
//     });
     
//     // Map userIds to corresponding user details for quick lookup
//     const userMap = {};
//     users.forEach(user => {
//       userMap[user.id] = { senderImage: user.image, senderName: user.name };
//     });

//     // Combine task details with their associated meeting details, subtasks, and comments
//     const combinedResult = tasks.map(task => {
//       const taskData = task.dataValues; // Extracting dataValues from Sequelize object
//       const meetingDetails = meetings.find(m => m.id === parseInt(task.meetingId));

//       // Find task comments associated with the current task
//       const commentsForTask = taskComments
//         .filter(comment => comment.TaskId === taskIdNum)
//         .map(comment => ({
//           id: comment.id,
//           senderId: comment.senderId,
//           message: comment.message,
//           file: comment.file,
//           createdAt: comment.createdAt,
//           updatedAt: comment.updatedAt,
//           TaskId: comment.TaskId,
//           SubTaskId: comment.SubTaskId,
//           senderName: userMap[parseInt(comment.senderId)].senderName, // Attach senderName directly
//           senderImage: userMap[parseInt(comment.senderId)].senderImage // Attach senderImage directly
//         }));

//       return {
//         id: taskData.id,
//         decision: taskData.decision,
//         date: meetingDetails.date,
//         meetingnumber: meetingDetails.meetingnumber,
//         priority: taskData.priority,
//         members: taskData.members,
//         dueDate: taskData.dueDate,
//         status: taskData.status,
//         createdAt: taskData.createdAt,
//         updatedAt: taskData.updatedAt,
//         file: taskData.file,
//         comments: commentsForTask
//       };
//     });
//     res.status(200).json(combinedResult);
//   } catch (error) {
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };
const GetTaskbyId = async (req, res) => {
  const taskId = req.params.id;
  try {
    // Fetch the task details
    const tasks = await db.Task.findAll({
      where: { id: taskId },
    });

    // Extracting meetingId from tasks
    const meetingIds = tasks.map(item => parseInt(item.meetingId));

    // Fetch the meeting details
    const meetings = await db.Meeting.findAll({
      attributes: ['id', 'date', 'meetingnumber'],
      where: {
        id: meetingIds // Filter meetings based on meetingIds array
      },
      raw: true // Get raw data instead of Sequelize model instances
    });

    // Fetch task comments for the given task (using task's own ID)
    const taskComments = await db.SubTaskDoc.findAll({
      where: {
        TaskId: taskId // Filter by the current task's ID
      },
      raw: true // Get raw data instead of Sequelize model instances
    });

    // Extract unique userIds from comments
    const userIds = [...new Set(taskComments.map(item => parseInt(item.senderId)))];

    // Fetch user details based on userIds
    const users = await db.User.findAll({
      attributes: ['id', 'image', 'name'],
      where: {
        id: userIds
      },
      raw: true // Get raw data instead of Sequelize model instances
    });

    // Create a map of userIds to corresponding user details for quick lookup
    const userMap = {};
    users.forEach(user => {
      userMap[user.id] = { senderImage: user.image, senderName: user.name };
    });

    // Combine task details with their associated meeting details, subtasks, and comments
    const combinedResult = tasks.map(task => {
      const taskData = task.dataValues; // Extracting dataValues from Sequelize object
      const meetingDetails = meetings.find(m => m.id === parseInt(task.meetingId));

      // Filter task comments for the current task
      const taskCommentsForTask = taskComments.filter(comment => comment.TaskId === taskId);

      // Map userIds in comments to user details using userMap
      const commentsWithUserInfo = taskCommentsForTask.map(comment => {
      const userId = parseInt(comment.senderId);
      return {
          ...comment,
          senderName: userMap[parseInt(comment.senderId)].senderName, // Attach senderName directly
          senderImage: userMap[parseInt(comment.senderId)].senderImage // Attach senderImage directly
        };
      });

      return {
        id: taskData.id,
        decision: taskData.decision,
        date: meetingDetails.date,
        meetingnumber: meetingDetails.meetingnumber,
        priority: taskData.priority,
        members: taskData.members,
        dueDate: taskData.dueDate,
        status: taskData.status,
        createdAt: taskData.createdAt,
        updatedAt: taskData.updatedAt,
        file: taskData.file,
        comments: commentsWithUserInfo // Include comments with senderImage and senderName
      };
    });

    res.status(200).json(combinedResult);
  } catch (error) {
    console.error('Error fetching task details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
const UpdateTask = async (req, res) => {
  try {
    const taskId = req.params.id; // Assuming taskId is part of the URL
    const updateData = req.body;
    let { members } = req.body
    let file = req.file;
    const selectedmember = JSON.stringify(members);

    if (file) {
      updateData = {
        members: selectedmember,
        file: `${process.env.IMAGE_URI}/images/${req.file.filename}`,
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
const GetAllTask = async (req, res) => {
  const { search = '', page = 1, pageSize = 5, sortBy = 'id DESC', ...restQueries } = req.query;
  let Query = req.query;

  // Extracting entityId and teamId from query parameters
  const entityId = Query?.entity ?? null;
  const teamId = Query?.team ?? null;
  const userId = Query?.user ?? null;

  console.log(entityId, teamId, userId, "recived form params ")

  const filters = {};

  for (const key in restQueries) {
    filters[key] = restQueries[key];
  }

  const offset = (parseInt(page) - 1) * parseInt(pageSize);
  if (entityId) {
    let EntiyMeet = await db.Meeting.findAll({ where: { EntityId: entityId } });
    const EntID = EntiyMeet.map(meeting => meeting.dataValues.id);
    console.log(EntID)
    var { count, rows } = await db.Task.findAndCountAll({
      where: {
        meetingId: EntID
      },
      raw: true // Get raw data instead of Sequelize model instances
    });
  }
  else if (teamId) {
    let TeamMeet = await db.Meeting.findAll({ where: { TeamId: teamId } });
    const TmID = TeamMeet.map(meeting => meeting.dataValues.id);
    var { count, rows } = await db.Task.findAndCountAll({
      where: {
        meetingId: TmID
      },
      raw: true // Get raw data instead of Sequelize model instances
    });

  }
  else if (userId) {
    let UserMeet = await db.Meeting.findAll({ where: { UserId: userId } });
    const UsrID = UserMeet.map(meeting => meeting.dataValues.id);
    console.log(UsrID)
    var { count, rows } = await db.Task.findAndCountAll({
      where: {
        meetingId: UsrID
      },
      raw: true // Get raw data instead of Sequelize model instances
    });

  }

  const totalEntities = count;
  const totalPages = Math.ceil(totalEntities / pageSize);

  res.json({
    Task: rows,
    totalPages: parseInt(totalPages),
    currentPage: parseInt(page),
    pageSize: parseInt(pageSize),
    totalTask: parseInt(totalEntities),
    startTask: parseInt(offset) + 1, // Correct the start entity index
    endTask: parseInt(offset) + parseInt(pageSize), // Correct the end entity index
    search
  });
}
const SubTaskAdd = async (req, res) => {   
  try {
  var data = req.body;
  let file = req.file;
  let Collaborators = req.body

  if (file) {
    data = {
      image: `${process.env.IMAGE_URI}/images/${req.file.filename}`,
      ...data,
    }
  }

  const task = await db.SubTask.create({ TaskId: req.params.id,Collaborators : Collaborators }, data);
  res.status(201).send(task);
} catch (error) {
  console.error("Error creating task:", error);
  res.status(500).send("Error creating task");
}
};
const SubTaskUpdate = async (req, res) =>{
try {
  const updateData = req.body;
  let file = req.file;

  if (file) {
    updateData = {
      file: `${process.env.IMAGE_URI}/images/${req.file.filename}`,
      ...updateData,
    }
  }

  const updatedTask = await db.SubTask.update(updateData, {
    where: { id: req.params.id }
  });
  res.status(200).json({ message: "successfully updated",updatedTask })
} catch (error) {
  console.error("Error updating task:", error);
  res.status(500).send("Error updating task");
}
}
const SubTaskDelete = async (req, res) =>{
  try {
    await db.SubTask.destroy({
      where: { id: req.params.id },
      // truncate: true
    });

    res.status(200).json({ message: `deleted successfully ${req.params.id}` });
  } catch (error) {
    console.error("Error deleting:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
 }
// const GetSubTaskbyId = async (req, res) => {
//   const SubId = req.params.id;
//   console.log(SubId, "this guy is from params ");
//   try {
//     // Fetch the task details
//     const SubTask = await db.SubTask.findAll({
//       where: { id: SubId },
//     });
//     const taskIdNum = parseInt(SubId);
//     const taskComments = await db.SubTaskDoc.findAll({
//       where: {
//         SubTaskId: taskIdNum
//       },
//       raw: true // Get raw data instead of Sequelize model instances
//     });

//     const userIds = [...new Set(taskComments.map(item => parseInt(item.senderId)))];

//     // Fetch user details based on userIds
//     const users = await db.User.findAll({
//       attributes: ['id', 'image', 'name'],
//       where: {
//         id: userIds
//       },
//       raw: true // Get raw data instead of Sequelize model instances
//     });
//     // Create a map of userIds to corresponding user details for quick lookup
//     const userMap = {};
//     users.forEach(user => {
//       userMap[user.id] = { senderImage: user.image, senderName: user.name };
//     })

//       return {
//         id: taskData.id,
//         decision: taskData.decision,
//         date: meetingDetails.date,
//         meetingnumber: meetingDetails.meetingnumber,
//         priority: taskData.priority,
//         members: taskData.members,
//         dueDate: taskData.dueDate,
//         status: taskData.status,
//         createdAt: taskData.createdAt,
//         updatedAt: taskData.updatedAt,
//         file: taskData.file,
//         comments: taskComments // Include comments with senderImage and senderName
//       };
//     });



//     res.status(200).json(combinedResult);
//   } catch (error) {
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// const GetSubTaskbyId = async (req, res) => {
//   const subId = req.params.id;
//   console.log(subId, "this guy is from params "); // Debugging log

//   try {
//     // Fetch the SubTask details based on subId
//     const subTask = await db.SubTask.findAll({
//       where: { id: subId },
//     });

//     // Convert subId to a number for querying
//     const taskIdNum = parseInt(subId);

//     // Fetch all SubTaskDoc (comments) related to the taskIdNum
//     const taskComments = await db.SubTaskDoc.findAll({
//       where: { SubTaskId: taskIdNum },
//       raw: true, // Get raw data instead of Sequelize model instances
//     });

//     // Extract unique userIds from taskComments
//     const userIds = [...new Set(taskComments.map(item => parseInt(item.senderId)))];

//     // Fetch user details based on userIds
//     const users = await db.User.findAll({
//       attributes: ['id', 'image', 'name'],
//       where: { id: userIds },
//       raw: true, // Get raw data instead of Sequelize model instances
//     });

//     // Create a map of userIds to corresponding user details for quick lookup
//     const userMap = {};
//     users.forEach(user => {
//       userMap[user.id] = { senderImage: user.image, senderName: user.name };
//     });

//     // Construct the response object
//     const response = {
         
//          comments: taskComments.map(comment => ({
//         ...comment,
//         senderImage: userMap[parseInt(comment.senderId)].senderImage,
//         senderName: userMap[parseInt(comment.senderId)].senderName,
//       })),
//     };

//     // Return the constructed response
//     return res.status(200).json(response);

//   } catch (error) {
//     console.error("Error fetching subtask by id:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };
const GetSubTaskbyId = async (req, res) => {
  const subId = req.params.id;
  console.log(subId, "this guy is from params "); // Debugging log

  try {
    // Fetch the SubTask details based on subId
    const subTask = await db.SubTask.findByPk(subId); // Change to findByPk for single record lookup

    if (!subTask) {
      return res.status(404).json({ message: "SubTask not found" });
    }

    // Fetch all SubTaskDoc (comments) related to the SubTask
    const taskComments = await db.SubTaskDoc.findAll({
      where: { SubTaskId: subId },
      raw: true, // Get raw data instead of Sequelize model instances
    });

    // Fetch additional Task details associated with the SubTask (assuming TaskId exists)
    const task = await db.Task.findByPk(subTask.TaskId);

    // Extract user IDs from comments
    const userIds = [...new Set(taskComments.map(item => parseInt(item.senderId)))];

    // Fetch user details based on userIds
    const users = await db.User.findAll({
      attributes: ['id', 'name', 'image'],
      where: { id: userIds },
      raw: true, // Get raw data instead of Sequelize model instances
    });

    // Create a map of userIds to corresponding user details for quick lookup
    const userMap = {};
    users.forEach(user => {
      userMap[user.id] = { senderName: user.name, senderImage: user.image };
    });

    // Construct the response object
    const response = {
      id: subTask.id,
      decision: subTask.decision,
      date: subTask.date,
      meetingnumber: subTask.meetingnumber,
      priority: subTask.priority,
      members: subTask.members,
      dueDate: subTask.dueDate,
      status: subTask.status,
      createdAt: subTask.createdAt,
      updatedAt: subTask.updatedAt,
      file: subTask.file,
      comments: taskComments.map(comment => ({
        id: comment.id,
        senderId: comment.senderId,
        message: comment.message,
        file: comment.file,
        TaskId: comment.TaskId,
        SubTaskId: comment.SubTaskId,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        senderName: userMap[parseInt(comment.senderId)] ? userMap[parseInt(comment.senderId)].senderName : null,
        senderImage: userMap[parseInt(comment.senderId)] ? userMap[parseInt(comment.senderId)].senderImage : null,
      })),
    };

    // Return the constructed response
    return res.status(200).json([response]); // Wrap response in an array as shown in the desired format

  } catch (error) {
    console.error("Error fetching subtask by id:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { GetSubTaskbyId };


const GetSublistId = (req, res) => {
  const SubId = req.params.id;
  mycon.query('SELECT * FROM SubTasks WHERE id = ? ORDER BY id DESC', SubId, (err, result) => {
    if (err) {
      console.error('Error retrieving data: ' + err.stack);
      res.status(500).send('Error retrieving data');
      return;
    }

    if (result.length === 0) {
      res.status(404).send('No data not found');
      return;
    }

    res.status(200).json(result);
  });
};

const GetSubList = async (req, res) => {
  const { search = '', page = 1, pageSize = 5, ...restQueries } = req.query;
  const filters = {};

  for (const key in restQueries) {
    filters[key] = restQueries[key];
  }
  const offset = (parseInt(page) - 1) * parseInt(pageSize);
    var { count, rows } = await db.SubTask.findAndCountAll({
      where: {
        TaskId: req.params.id
      },
      order: [['createdAt', 'DESC']],
      raw: true // Get raw data instead of Sequelize model instances
    });


    const totalEntities = count;
    const totalPages = Math.ceil(totalEntities / pageSize);
    res.json({
      Task: rows,
      totalPages: parseInt(totalPages),
      currentPage: parseInt(page),
      pageSize: parseInt(pageSize),
      totalTask: parseInt(totalEntities),
      startTask: parseInt(offset) + 1, // Correct the start entity index
      endTask: parseInt(offset) + parseInt(pageSize), // Correct the end entity index
      search
    });
  }
const CreateTskDoc = async (req, res) => {
    try {
      let file = req.file;
      let data = req.body;
      let Query = req.query;
  
      // Extracting entityId and teamId from query parameters
      const TaskId = Query?.task ?? null;
      const SubTaskId = Query?.subtask ?? null;
  
      // Modify data if file is present
      if (file) {
        data = {
          file: `${process.env.IMAGE_URI}/images/${req.file.filename}`,
          ...data,
          TaskId: TaskId,
          SubTaskId: SubTaskId
        };
      } else {
        data = {
          ...data,
          TaskId: TaskId,
          SubTaskId: SubTaskId
        };
      }
  
      let task;
      if (TaskId) {
        task = await db.SubTaskDoc.create(data);
      } else if (SubTaskId) {
        task = await db.SubTaskDoc.create(data);
      }
  
      res.status(201).send({ message: "Task created successfully", task: task });
    } catch (error) {
      console.error("Error creating Task:", error);
      res.status(500).send("Error creating task");
    }
  };
    
const patchTskDoc = async (req, res) =>{
    try {
      const updateData = req.body;
      let file = req.file;

      if (file) {
        updateData = {
          file: `${process.env.IMAGE_URI}/images/${req.file.filename}`,
          ...updateData,
        }
      }
      const updatedTask = await db.SubTaskDoc.update(updateData, {
        where: { id: req.params.id }
      });
      res.status(200).json({ message: "successfully updated",updatedTask })
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).send("Error updating task");
    }
    }

const DeleteTskDoc = async (req, res) =>{
      try {
        await db.SubTaskDoc.destroy({
          where: { id: req.params.id },
          // truncate: true
        });
    
        res.status(200).json({ message: `deleted successfully ${req.params.id}` });
      } catch (error) {
        console.error("Error deleting:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
     }




module.exports = {
  CreateTask,
  GetTask,
  UpdateTask,
  DeleteTask,
  GetTaskbyId,
  GetAllTask,
  SubTaskAdd,
  SubTaskUpdate,
  SubTaskDelete,
  GetSubTaskbyId,
  GetSublistId,
  GetSubList,
  CreateTskDoc,
  patchTskDoc,
  DeleteTskDoc
};



