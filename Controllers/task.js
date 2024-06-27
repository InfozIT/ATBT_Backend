var db = require('../models/index');
const mycon = require('../DB/mycon');
const transporter = require('../utils/nodemailer')
const { Op, where, Sequelize } = require('sequelize');
const moment = require('moment');
const { uploadToS3 } = require('../utils/wearhouse');
const winston = require('winston');





function convertDateFormat(dateStr) {
  // Split the date string by '-'
  let parts = dateStr.split('-');

  // Rearrange the parts to 'dd-mm-yyyy'
  let formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

  return formattedDate;
}


const CreateTask = async (req, res) => {
  try {
    let file = req.file;
    var data = req.body;
    let { createdby, collaborators, taskCreatedBy } = req.body;
    let bmId = req.params.id;

    // Convert taskCreatedBy to a JSON string
    const taskCreatedByString = JSON.stringify(taskCreatedBy);

    if (file) {
      const result = await uploadToS3(req.file);
      data = {
        image: `${result.Location}`,
        taskCreatedBy: taskCreatedByString, // Save as string

        ...data
      };
    } else {
      data = {
        ...data,
        taskCreatedBy: taskCreatedByString // Save as string
      };
    }

    let task = await db.Task.create({ meetingId: bmId, createdby: createdby, collaborators: collaborators, taskCreatedBy: taskCreatedByString });

    let createdid = task.dataValues.id;

    // if (createdid){

    // await db.Task.update(
    //   { update_count: 1 },  // Set emailSent to true
    //   { where: { id: createdid }, raw: true }  // Specify the task ID
    // );
    // }
    res.status(201).send(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).send("Error creating task");
  }
};


const UpdateTask = async (req, res) => {
  try {
    const taskId = req.params.id; // Assuming taskId is part of the URL
    const updateData = req.body;
    let { members } = req.body;
    let data = req.body;
    const { userId} = req.user;

    // console.log("userId", userId)
    let file = req.file;
    const selectedmember = JSON.stringify(members);

    if (file) {
      const result = await uploadToS3(req.file);
      updateData = {
        image: `${result.Location}`,
        members: selectedmember,
        createdby: userId,
        ...data,
      }
    }
    const updatedTask = await db.Task.update(updateData, {
      where: { id: req.params.id }
    });
    // try {
      let member = await db.Task.findOne({ where: {id: req.params.id} });
      if (!member) {
        return res.status(404).json({ error: "Meeting not found" });
      }

      meetMembers =[]
      let decision = member.dataValues.decision;
      let dueDate = member.dataValues.dueDate;
      let PR = member.dataValues.members;
      let meetingId = member.dataValues.meetingId;
      let blo = member.dataValues.taskCreatedBy;
      let jsonObject = JSON.parse(blo);

      let taskCreatorName = '';
      if (jsonObject && jsonObject.name == "entities") {
        const entity = await db.Entity.findOne({
          attributes: ['name'],
          where: { id: jsonObject.id },
          raw: true
        });
        taskCreatorName = entity ? entity.name : '';
      } else if (jsonObject && jsonObject.name == "teams") {
        const team = await db.Team.findOne({
          attributes: ['name'],
          where: { id: jsonObject.id },
          raw: true
        });
        console.log(team)
        taskCreatorName = team ? team.name : '';
  
      }

      meetMembers.push(userId)
      meetMembers.push(PR)

      // Fetch creator's name
      const creator = await db.Meeting.findOne({
        attributes: ['meetingnumber'],
        where: { id: meetingId },
        raw: true,
      });


      const meetingnumber = creator.meetingnumber;

      // Fetch emails and names of the members
      const emailResults = await db.User.findAll({
        attributes: ['email', 'name'],
        where: { id: { [Op.in]: meetMembers } },
        raw: true,
      });

      const emails = emailResults.map(entry => entry.email);
      let currentDate = new Date().toISOString().slice(0, 10);

      let Ceatorname = await db.User.findAll({
        attributes: ['name'],
        where: { id: userId },
        raw: true,
      });
      let Creatorname = Ceatorname.map(entry => entry.name);


      const names = emailResults.map(entry => entry.name);

      // Send individual emails to each recipient
      for (let i = 0; i < emails.length; i++) {
        const mailData = {
          from: 'nirajkr00024@gmail.com',
          to: emails[i],
          subject: `Action Required: Task Created for ${names[i]} `,
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
                 justify-content: center;
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
              You've been assigned a decision from <span style="font-weight:bold"> ${taskCreatorName}</span>, made during <span style="font-weight:bold"> ${meetingnumber}</span>. Here are the details:
              </p>
             <table>
              <thead>
                <th>Decision Taken</th>
                <th>Assigned Date</th>
                <th>Due Date</th>
              </thead>
              <tbody>
                <tr>
                  <td> ${decision}</td>
                <td> ${currentDate}</td>
                <td> ${dueDate}</td>
                </tr>
              </tbody>
             </table>
             <p>Please ensure that the decision assigned to you is completed by the due date.</p>
              <p style="padding-top: 15px;">Best regards,</p>
              <p>${Creatorname}</p>
              <p>Kapil Group</p>
            </div>
          `,
        };
        


        let tasks = await db.Task.findAll({
          where: { id: req.params.id },
          raw: true,
        });

        let due = tasks.map(entry => entry.dueDate);
        let dec = tasks.map(entry => entry.decision);

        if (due.every(date => date != null) && dec.every(decision => decision != null)) {
          await transporter.sendMail(mailData);

        }
      }

    res.status(200).json({ message: "successfully updated" })
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).send("Error updating task");
  }
};







// const GetTaskbyId = async (req, res) => {
//   const taskId = req.params.id;
//   try {
//     // Fetch the task details
//     let task = await db.Task.findOne({
//       where: { id: taskId },
//     });

//     if (!task) {
//       return res.status(404).json({ error: 'Task not found' });
//     }
//     let ids = task.dataValues.taskCreatedBy
//     let jsonObject = JSON.parse(ids);

//     // Extracting meetingId from task
//     const meetingId = parseInt(task.meetingId, 10);
//     if (isNaN(meetingId)) {
//       return res.status(400).json({ error: 'Invalid meeting ID' });
//     }

//     // Fetch the meeting details
//     const meeting = await db.Meeting.findOne({
//       where: { id: meetingId },
//       raw: true
//     });

//     if (!meeting) {
//       return res.status(404).json({ error: 'Meeting not found' });
//     }

//     const { EntityId, TeamId, members: meetingMembers, UserId } = meeting;
//     let groupMembers = [];

//     // Fetch users based on EntityId
//     if (EntityId) {
//       const entityMembers = await db.User.findAll({
//         attributes: ['id', 'name', 'email', 'image', 'entityname'],
//         where: { entityname: EntityId },
//         raw: true
//       });
//       groupMembers.push(...entityMembers);
//     }

//     // Fetch users based on TeamId
//     if (TeamId) {
//       const team = await db.Team.findOne({
//         attributes: ['members'],
//         where: { id: TeamId },
//         raw: true
//       });

//       if (team) {
//         const teamMemberIds = team.members.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
//         const teamMembers = await db.User.findAll({
//           attributes: ['id', 'name', 'email', 'image', 'entityname'],
//           where: { id: { [Op.in]: teamMemberIds } },
//           raw: true
//         });
//         groupMembers.push(...teamMembers);
//       }
//     }



//     // Add meeting members
//     const meetingMemberIds = meetingMembers.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
//     const meetingUsers = await db.User.findAll({
//       attributes: ['id', 'name', 'email', 'image', 'entityname'],
//       where: { id: { [Op.in]: meetingMemberIds } },
//       raw: true
//     });
//     groupMembers.push(...meetingUsers);

//     // Fetch user details for the meeting's creator
//     const meetingUser = await db.User.findOne({
//       attributes: ['id', 'name', 'email', 'image', 'entityname'],
//       where: { id: UserId },
//       raw: true
//     });

//     if (meetingUser && !groupMembers.some(member => member.id === meetingUser.id)) {
//       groupMembers.push(meetingUser);
//     }

//     // Fetch task comments for the given task
//     const taskComments = await db.SubTaskDoc.findAll({
//       where: { TaskId: taskId },
//       raw: true
//     });

//     // Extract unique userIds from comments
//     const commentUserIds = [...new Set(taskComments.map(item => parseInt(item.senderId, 10)))].filter(id => !isNaN(id));
//     const users = await db.User.findAll({
//       attributes: ['id', 'name', 'image'],
//       where: { id: { [Op.in]: commentUserIds } },
//       raw: true
//     });

//     // Create a map of userIds to corresponding user details for quick lookup
//     const userMap = {};
//     users.forEach(user => {
//       userMap[user.id] = { senderImage: user.image, senderName: user.name };
//     });

//     // Prepare the comments array with senderName and senderImage
//     const commentsWithUserInfo = taskComments.map(comment => ({
//       ...comment,
//       senderName: userMap[parseInt(comment.senderId, 10)] ? userMap[parseInt(comment.senderId, 10)].senderName : null,
//       senderImage: userMap[parseInt(comment.senderId, 10)] ? userMap[parseInt(comment.senderId, 10)].senderImage : null
//     }));

//     // Fetch user details for the collaborators
//     const collaborators = task.collaborators.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
//     let collaboratorsUsers = [];

//     if (collaborators.length > 0) {
//       collaboratorsUsers = await db.User.findAll({
//         attributes: ['id', 'name', 'email', 'image', 'entityname'],
//         where: { id: { [Op.in]: collaborators } },
//         raw: true
//       });
//     }

//     // Fetch task creator entity name
//     let taskCreatorName = '';
//     if (jsonObject && jsonObject.name == "entities") {
//       const entity = await db.Entity.findOne({
//         attributes: ['name'],
//         where: { id: jsonObject.id },
//         raw: true
//       });
//       console.log(entity)
//       taskCreatorName = entity ? entity.name : '';
//     } else if (jsonObject && jsonObject.name == "teams") {
//       const team = await db.Team.findOne({
//         attributes: ['name'],
//         where: { id: jsonObject.id },
//         raw: true
//       });
//       console.log(team)
//       taskCreatorName = team ? team.name : '';

//     }

//     let createdAtTime = new Date(task.createdAt);
//     let cTime = new Date();
//     let timeDiff = cTime.getTime() - createdAtTime.getTime();
//     let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
//     task.age =diffDays

//     // Prepare the response data
//     const combinedResult = {
//       id: task.id,
//       decision: task.decision,
//       SubTaskCount: await db.SubTask.count({ where: { TaskId: taskId } }),
//       date: meeting ? meeting.date : null,
//       taskCreateby:taskCreatorName,
//       age: task.age,
//       taskCreateBY: jsonObject,
//       meetingnumber: meeting ? meeting.meetingnumber : null,
//       priority: task.priority || null,
//       members: task.members,
//       collaborators: collaboratorsUsers,
//       dueDate: task.dueDate,
//       status: task.status,
//       createdAt: task.createdAt,
//       updatedAt: task.updatedAt,
//       file: task.file || null,
//       comments: commentsWithUserInfo || [],
//       group: groupMembers.filter(member => member.entityname !== null)
//     };

//     // Send the response
//     res.status(200).json([combinedResult]);
//   } catch (error) {
//     console.error('Error fetching task details:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };


const GetTaskbyId = async (req, res) => {
  const taskId = req.params.id;
  try {
    // Fetch the task details
    let task = await db.Task.findOne({
      where: { id: taskId },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    let ids = task.dataValues.taskCreatedBy
    let jsonObject = JSON.parse(ids);

    // Extracting meetingId from task
    const meetingId = parseInt(task.meetingId, 10);
    if (isNaN(meetingId)) {
      return res.status(400).json({ error: 'Invalid meeting ID' });
    }

    // Fetch the meeting details
    const meeting = await db.Meeting.findOne({
      where: { id: meetingId },
      raw: true
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const { EntityId, TeamId, members: meetingMembers, UserId } = meeting;
    let groupMembers = [];

    // Fetch users based on EntityId
    if (EntityId) {
      const entityMembers = await db.User.findAll({
        attributes: ['id', 'name', 'email', 'image', 'entityname'],
        where: { entityname: EntityId },
        raw: true
      });
      groupMembers.push(...entityMembers);
    }

    // Fetch users based on TeamId
    if (TeamId) {
      const team = await db.Team.findOne({
        attributes: ['members'],
        where: { id: TeamId },
        raw: true
      });

      if (team) {
        const teamMemberIds = team.members.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
        const teamMembers = await db.User.findAll({
          attributes: ['id', 'name', 'email', 'image', 'entityname'],
          where: { id: { [Op.in]: teamMemberIds } },
          raw: true
        });
        groupMembers.push(...teamMembers);
      }
    }



    // Add meeting members
    const meetingMemberIds = meetingMembers.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    const meetingUsers = await db.User.findAll({
      attributes: ['id', 'name', 'email', 'image', 'entityname'],
      where: { id: { [Op.in]: meetingMemberIds } },
      raw: true
    });
    groupMembers.push(...meetingUsers);

    // Fetch user details for the meeting's creator
    const meetingUser = await db.User.findOne({
      attributes: ['id', 'name', 'email', 'image', 'entityname'],
      where: { id: UserId },
      raw: true
    });

    if (meetingUser && !groupMembers.some(member => member.id === meetingUser.id)) {
      groupMembers.push(meetingUser);
    }

    // Fetch task comments for the given task
    const taskComments = await db.SubTaskDoc.findAll({
      where: { TaskId: taskId },
      raw: true
    });

    // Extract unique userIds from comments
    const commentUserIds = [...new Set(taskComments.map(item => parseInt(item.senderId, 10)))].filter(id => !isNaN(id));
    const users = await db.User.findAll({
      attributes: ['id', 'name', 'image'],
      where: { id: { [Op.in]: commentUserIds } },
      raw: true
    });

    // Create a map of userIds to corresponding user details for quick lookup
    const userMap = {};
    users.forEach(user => {
      userMap[user.id] = { senderImage: user.image, senderName: user.name };
    });

    // Prepare the comments array with senderName and senderImage
    const commentsWithUserInfo = taskComments.map(comment => ({
      ...comment,
      senderName: userMap[parseInt(comment.senderId, 10)] ? userMap[parseInt(comment.senderId, 10)].senderName : null,
      senderImage: userMap[parseInt(comment.senderId, 10)] ? userMap[parseInt(comment.senderId, 10)].senderImage : null
    }));

    // Fetch user details for the collaborators
    const collaborators = task.collaborators.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    let collaboratorsUsers = [];

    if (collaborators.length > 0) {
      collaboratorsUsers = await db.User.findAll({
        attributes: ['id', 'name', 'email', 'image', 'entityname'],
        where: { id: { [Op.in]: collaborators } },
        raw: true
      });
    }

    // Fetch task creator entity name
    let taskCreatorName = '';
    if (jsonObject && jsonObject.name == "entities") {
      const entity = await db.Entity.findOne({
        attributes: ['name'],
        where: { id: jsonObject.id },
        raw: true
      });
      console.log(entity)
      taskCreatorName = entity ? entity.name : '';
    } else if (jsonObject && jsonObject.name == "teams") {
      const team = await db.Team.findOne({
        attributes: ['name'],
        where: { id: jsonObject.id },
        raw: true
      });
      console.log(team)
      taskCreatorName = team ? team.name : '';

    }

    let createdAtTime = new Date(task.createdAt);
    let cTime = new Date();
    let timeDiff = cTime.getTime() - createdAtTime.getTime();
    let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    task.age = diffDays


    // Fetch task logs
    const taskLogs = await db.TaskLog.findAll({
      where: { taskId: taskId },
      raw: true
    });

    // Fetch unique user IDs from the task logs
    const userIds = new Set();
    taskLogs.forEach(log => {
      log.changes.forEach(change => {
        if (change.changedBy) userIds.add(change.changedBy);
        if (change.fieldChanged === 'collaborators') {
          if (change.newValue) userIds.add(change.newValue);
          if (change.oldValue) userIds.add(change.oldValue);
        }
      });
    });

    // Convert userIds set to array
    const userIdsArray = Array.from(userIds);

    // Fetch user details from the User table
    const userss = await db.User.findAll({
      attributes: ['id', 'name'],
      where: { id: { [Op.in]: userIdsArray } },
      raw: true
    });

    // Create a map of user IDs to names for quick lookup
    const userMapp = {};
    userss.forEach(user => {
      userMapp[user.id] = user.name;
    });

    // Enhance task logs with user names
    const enhancedTaskLogs = taskLogs.map(log => ({
      ...log,
      changes: log.changes.map(change => ({
        ...change,
        changedBy: userMapp[change.changedBy] || change.changedBy,
        newValue: change.fieldChanged === 'collaborators' ? userMapp[change.newValue] || change.newValue : change.newValue,
        oldValue: change.fieldChanged === 'collaborators' ? userMapp[change.oldValue] || change.oldValue : change.oldValue
      }))
    }));

    // Prepare the response data
    const combinedResult = {
      id: task.id,
      decision: task.decision,
      SubTaskCount: await db.SubTask.count({ where: { TaskId: taskId } }),
      date: meeting ? meeting.date : null,
      taskCreateby: taskCreatorName,
      age: task.age,
      taskCreateBY: jsonObject,
      meetingnumber: meeting ? meeting.meetingnumber : null,
      priority: task.priority || null,
      members: task.members,
      collaborators: collaboratorsUsers,
      dueDate: task.dueDate,
      status: task.status,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      file: task.file || null,
      comments: commentsWithUserInfo || [],
      group: groupMembers.filter(member => member.entityname !== null),
      activeLog: enhancedTaskLogs // Include the task logs in the response
    };

    // Send the response
    res.status(200).json([combinedResult]);
  } catch (error) {
    console.error('Error fetching task details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// const GetTaskbyId = async (req, res) => {
//   const taskId = req.params.id;
//   try {
//     // Fetch the task details
//     let task = await db.Task.findOne({
//       where: { id: taskId },
//     });
//     let TC = task.dataValues.taskCreatedBy
//     console.log(TC)
//     if (!task) {
//       return res.status(404).json({ error: 'Task not found' });
//     }

//     // Extracting meetingId from task
//     const meetingId = parseInt(task.meetingId, 10);
//     if (isNaN(meetingId)) {
//       return res.status(400).json({ error: 'Invalid meeting ID' });
//     }

//     // Fetch the meeting details
//     const meeting = await db.Meeting.findOne({
//       where: { id: meetingId },
//       raw: true
//     });

//     if (!meeting) {
//       return res.status(404).json({ error: 'Meeting not found' });
//     }

//     const { EntityId, TeamId, members: meetingMembers, UserId } = meeting;

//     let groupMembers = [];

//     // Fetch users based on EntityId
//     if (EntityId) {
//       const entityMembers = await db.User.findAll({
//         attributes: ['id', 'name', 'email', 'image', 'entityname'],
//         where: { entityname: EntityId },
//         raw: true
//       });
//       groupMembers.push(...entityMembers);
//     }

//     // Fetch users based on TeamId
//     if (TeamId) {
//       const team = await db.Team.findOne({
//         attributes: ['members'],
//         where: { id: TeamId },
//         raw: true
//       });

//       if (team) {
//         const teamMemberIds = team.members.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
//         const teamMembers = await db.User.findAll({
//           attributes: ['id', 'name', 'email', 'image', 'entityname'],
//           where: { id: { [Op.in]: teamMemberIds } },
//           raw: true
//         });
//         groupMembers.push(...teamMembers);
//       }
//     }

//     // Add meeting members
//     const meetingMemberIds = meetingMembers.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
//     const meetingUsers = await db.User.findAll({
//       attributes: ['id', 'name', 'email', 'image', 'entityname'],
//       where: { id: { [Op.in]: meetingMemberIds } },
//       raw: true
//     });
//     groupMembers.push(...meetingUsers);

//     // Fetch user details for the meeting's creator
//     const meetingUser = await db.User.findOne({
//       attributes: ['id', 'name', 'email', 'image', 'entityname'],
//       where: { id: UserId },
//       raw: true
//     });

//     if (meetingUser && !groupMembers.some(member => member.id === meetingUser.id)) {
//       groupMembers.push(meetingUser);
//     }

//     // Fetch task comments for the given task
//     const taskComments = await db.SubTaskDoc.findAll({
//       where: { TaskId: taskId },
//       raw: true
//     });

//     // Extract unique userIds from comments
//     const commentUserIds = [...new Set(taskComments.map(item => parseInt(item.senderId, 10)))].filter(id => !isNaN(id));
//     const users = await db.User.findAll({
//       attributes: ['id', 'name', 'image'],
//       where: { id: { [Op.in]: commentUserIds } },
//       raw: true
//     });

//     // Create a map of userIds to corresponding user details for quick lookup
//     const userMap = {};
//     users.forEach(user => {
//       userMap[user.id] = { senderImage: user.image, senderName: user.name };
//     });

//     // Prepare the comments array with senderName and senderImage
//     const commentsWithUserInfo = taskComments.map(comment => ({
//       ...comment,
//       senderName: userMap[parseInt(comment.senderId, 10)] ? userMap[parseInt(comment.senderId, 10)].senderName : null,
//       senderImage: userMap[parseInt(comment.senderId, 10)] ? userMap[parseInt(comment.senderId, 10)].senderImage : null
//     }));

//     // Fetch user details for the collaborators
//     const collaborators = task.collaborators.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
//     let collaboratorsUsers = [];

//     if (collaborators.length > 0) {
//       collaboratorsUsers = await db.User.findAll({
//         attributes: ['id', 'name', 'email', 'image', 'entityname'],
//         where: { id: { [Op.in]: collaborators } },
//         raw: true
//       });
//     }

//     // Fetch task creator entity name
//     if(TC && TC.name=="entities"){
//     taskCreatorName = entity ? entity.name : '';
//       const entity = await db.Entity.findOne({
//       attributes: ['name'],
//       where: { id: TC.id },
//       raw: true
//     });
//     taskCreatorName = entity ? entity.name : '';
//     }
//     if (TC && TC.name=="teams") {
//       const Team = await db.Team.findOne({
//         attributes: ['name'],
//         where: { id: TC.id },
//         raw: true
//       });
//       taskCreatorEntityName = Team ? Team.name : '';
//     }

//     // Prepare the response data
//     const combinedResult = {
//       id: task.id,
//       decision: task.decision,
//       SubTaskCount: await db.SubTask.count({ where: { TaskId: taskId } }),
//       date: meeting ? meeting.date : null,
//       taskCreateby: '',
//       taskCreateBY: task.taskCreatedBy,
//       meetingnumber: meeting ? meeting.meetingnumber : null,
//       priority: task.priority || null,
//       members: task.members,
//       collaborators: collaboratorsUsers,
//       dueDate: task.dueDate,
//       status: task.status,
//       createdAt: task.createdAt,
//       updatedAt: task.updatedAt,
//       file: task.file || null,
//       comments: commentsWithUserInfo || [],
//       group: groupMembers.filter(member => member.entityname !== null)
//     };

//     // Send the response
//     res.status(200).json([combinedResult]);
//   } catch (error) {
//     console.error('Error fetching task details:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };



// const GetTaskbyId = async (req, res) => {
//   const taskId = req.params.id;
//   try {
//     // Fetch the task details
//     const task = await db.Task.findOne({
//       where: { id: taskId },
//     });

//     if (!task) {
//       return res.status(404).json({ error: 'Task not found' });
//     }

//     // Extracting meetingId from task
//     const meetingId = parseInt(task.meetingId);

//     // Fetch the meeting details
//     const meeting = await db.Meeting.findOne({
//       attributes: ['members', 'date', 'UserId', 'EntityId', 'TeamId', 'meetingnumber'], // Include TeamId in the attributes
//       where: { id: meetingId },
//       raw: true
//     });
//     if (!meeting) {
//       return res.status(404).json({ error: 'Meeting not found' });
//     }

//     // Extract member IDs from the meeting
//     const memberIds = meeting.members;
//     console.log(meetingId,"2222222222222222222222222222")

//     // Fetch user details for the members
//     let groupMembers = await db.User.findAll({
//       attributes: ['id', 'name', 'email', 'image', 'entityname'],
//       where: { id: { [Op.in]: memberIds } },
//       raw: true
//     });



//     // Fetch additional users based on EntityId from the meeting
//     const additionalUsers = await db.User.findAll({
//       attributes: ['id', 'name', 'email', 'image', 'entityname'],
//       where: { entityname: meeting.EntityId }, // Fetch users based on EntityId from meeting
//       raw: true
//     });

//     // Add additional users to the groupMembers array if found
//     if (additionalUsers.length > 0) {
//       groupMembers.push(...additionalUsers);
//     }

//     // Fetch additional users based on TeamId from the meeting
//     if (meeting.TeamId) {
//       const teamMembers = await db.Team.findOne({
//         attributes: ['id', 'members'],
//         where: { id: meeting.TeamId }, // Fetch team based on TeamId from meeting
//         raw: true
//       });

//       // Extract member IDs from the team
//       const teamMemberIds = teamMembers.members;

//       // Fetch user details for the team members
//       const teamUserDetails = await db.User.findAll({
//         attributes: ['id', 'name', 'email', 'image', 'entityname'],
//         where: { id: { [Op.in]: teamMemberIds } },
//         raw: true
//       });

//       // Add team members to the groupMembers array if found
//       if (teamUserDetails.length > 0) {
//         groupMembers.push(...teamUserDetails);
//       }
//     }

//     // Filter out users with entityname: null
//     groupMembers = groupMembers.filter(member => member.entityname !== null);

//     // Fetch user details for the user with the UserId from the meeting table
//     const meetingUser = await db.User.findOne({
//       attributes: ['id', 'name', 'email', 'image', 'entityname'],
//       where: { id: meeting.UserId },
//       raw: true
//     });

//     // Add the meetingUser to the groupMembers array if not already included and entityname is not null
//     if (meetingUser && meetingUser.entityname !== null && !groupMembers.some(member => member.id === meetingUser.id)) {
//       groupMembers.push(meetingUser);
//     }

//     // Fetch task comments for the given task
//     const taskComments = await db.SubTaskDoc.findAll({
//       where: { TaskId: taskId },
//       raw: true
//     });

//     // Extract unique userIds from comments
//     const userIds = [...new Set(taskComments.map(item => parseInt(item.senderId)))];

//     // Fetch user details based on userIds
//     const users = await db.User.findAll({
//       attributes: ['id', 'name', 'image'],
//       where: { id: { [Op.in]: userIds } },
//       raw: true
//     });

//     let { count } = await db.SubTask.findAndCountAll({
//       where: { TaskId: taskId },
//     });

//     // Create a map of userIds to corresponding user details for quick lookup
//     const userMap = {};
//     users.forEach(user => {
//       userMap[user.id] = { senderImage: user.image, senderName: user.name };
//     });

//     // Prepare the comments array with senderName and senderImage
//     const commentsWithUserInfo = taskComments.map(comment => ({
//       ...comment,
//       senderName: userMap[parseInt(comment.senderId)] ? userMap[parseInt(comment.senderId)].senderName : null,
//       senderImage: userMap[parseInt(comment.senderId)] ? userMap[parseInt(comment.senderId)].senderImage : null
//     }));

//     // Fetch user details based on userIds
//     // Extract member IDs from the meeting
//     const collaborators = task.collaborators;

//     // Fetch user details for the members
//     let collaboratorsusers = await db.User.findAll({
//       attributes: ['id', 'name', 'email', 'image', 'entityname'],
//       where: { id: { [Op.in]: collaborators } },
//       raw: true
//     });



//     // Prepare the response data
//     const combinedResult = {
//       id: task.id,
//       decision: task.decision,
//       SubTaskCount: count,
//       date: meeting ? meeting.date : null,
//       taskCreateby: "", // Initialize taskCreateby as empty string
//       taskCreateBY: task.taskCreatedBy,
//       meetingnumber: meeting ? meeting.meetingnumber : null,
//       priority: task.priority || null, // Use task priority or null if undefined
//       members: task.members,
//       collaborators: collaboratorsusers,
//       dueDate: task.dueDate,
//       status: task.status,
//       createdAt: task.createdAt,
//       updatedAt: task.updatedAt,
//       file: task.file || null, // Use task file or null if undefined
//       comments: commentsWithUserInfo || [], // Use comments array or empty array if undefined
//       group: groupMembers, // Include group field with all members associated with the task's meeting, including additional users based on EntityId and team members
//       // meetingnumber: meeting ? meeting.meetingnumber : null,
//     };

//     // Fetch task creator entity name
//     const taskCreator = task.taskCreatedBy;
//     console.log(taskCreator)
//     if (taskCreator && taskCreator.name === "users") {
//       const userEntity = await db.User.findOne({
//         attributes: ['entityname'],
//         where: { id: taskCreator.id }
//       });
//       if (userEntity) {
//         const EntID = userEntity.entityname;
//         const entity = await db.Entity.findOne({
//           attributes: ['name'],
//           where: { id: EntID }
//         });
//         if (task.collaborators) {
//           var colabs = await db.User.findAll({
//             attributes: ['id', 'name', 'image', 'email', 'entityname'],
//             where: {
//               id: { [Op.in]: task.collaborators }
//             },
//             raw: true
//           });
//         }
//         combinedResult.taskCreateby = entity ? entity.name : "";
//         combinedResult.collaborators = colabs;

//       }
//     } else if (taskCreator && taskCreator.name === "entities") {
//       const entity = await db.Entity.findOne({
//         attributes: ['name'],
//         where: { id: taskCreator.id }
//       });
//       if (task.collaborators) {
//         var colabs = await db.User.findAll({
//           attributes: ['id', 'name', 'image', 'email', 'entityname'],
//           where: {
//             id: { [Op.in]: task.collaborators }
//           },
//           raw: true
//         });
//       }
//       combinedResult.taskCreateby = entity ? entity.name : "";
//       // combinedResult.collaborators = task ? task.collaborators : "";
//       combinedResult.collaborators = colabs;

//     } else if (taskCreator && taskCreator.name === "teams") {
//       const entity = await db.Team.findOne({
//         attributes: ['name'],
//         where: { id: taskCreator.id }
//       });
//       if (task.collaborators) {
//         var colabs = await db.User.findAll({
//           attributes: ['id', 'name', 'image', 'email', 'entityname'],
//           where: {
//             id: { [Op.in]: [62] }
//           },
//           raw: true

//         });
//         console.log(colabs)
//       }
//       combinedResult.taskCreateby = entity ? entity.name : "";
//       // combinedResult.collaborators = task ? task.collaborators : "";
//       combinedResult.collaborators = colabs;

//     }

//     // Send the response
//     res.status(200).json([combinedResult]); // Wrap result in an array to match the specified format
//   } catch (error) {
//     console.error('Error fetching task details:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

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

  // console.log(entityId, teamId, userId, "recived form params ")

  const filters = {};

  for (const key in restQueries) {
    filters[key] = restQueries[key];
  }

  const offset = (parseInt(page) - 1) * parseInt(pageSize);
  if (entityId) {
    let EntiyMeet = await db.Meeting.findAll({ where: { EntityId: entityId } });
    const EntID = EntiyMeet.map(meeting => meeting.dataValues.id);
    // console.log(EntID)
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
    // console.log(UsrID)
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
    let data = req.body;
    const { userId } = req.user;

    // console.log(`User ID: ${userId}`);

    if (req.file) {
      const result = await uploadToS3(req.file);
      data.image = result.Location;
    }

    const task = await db.SubTask.create({
      ...data,
      TaskId: req.params.id,
      Collaborators: req.body.Collaborators
    });
    res.status(201).send(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).send(`Error creating task: ${error.message}`);
  }
};

const SubTaskUpdate = async (req, res) => {
  try {
    const updateData = req.body;
    let file = req.file;

    if (file) {
      const result = await uploadToS3(req.file)
      updateData = {
        file: `${result.Location}`,
        ...updateData,
      }
    }

    const updatedTask = await db.SubTask.update(updateData, {
      where: { id: req.params.id }
    });
    res.status(200).json({ message: "successfully updated", updatedTask })
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).send("Error updating task");
  }
}
const SubTaskDelete = async (req, res) => {
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
const GetSubTaskbyId = async (req, res) => {
  const subId = req.params.id;
  // console.log(subId, "this guy is from params "); // Debugging log

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

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const meetingId = parseInt(task.meetingId);


    // Fetch the meeting details
    const meeting = await db.Meeting.findOne({
      attributes: ['members', 'date', 'UserId', 'EntityId', 'TeamId', 'meetingnumber'], // Include TeamId in the attributes
      where: { id: meetingId },
      raw: true
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    // Extract member IDs from the meeting
    const memberIds = meeting.members;

    // Fetch user details for the members
    let groupMembers = await db.User.findAll({
      attributes: ['id', 'name', 'email', 'image', 'entityname'],
      where: { id: { [Op.in]: memberIds } },
      raw: true
    });



    // Fetch additional users based on EntityId from the meeting
    const additionalUsers = await db.User.findAll({
      attributes: ['id', 'name', 'email', 'image', 'entityname'],
      where: { entityname: meeting.EntityId }, // Fetch users based on EntityId from meeting
      raw: true
    });

    // Add additional users to the groupMembers array if found
    if (additionalUsers.length > 0) {
      groupMembers.push(...additionalUsers);
    }

    // Fetch additional users based on TeamId from the meeting
    if (meeting.TeamId) {
      const teamMembers = await db.Team.findOne({
        attributes: ['id', 'members'],
        where: { id: meeting.TeamId }, // Fetch team based on TeamId from meeting
        raw: true
      });

      // Extract member IDs from the team
      const teamMemberIds = teamMembers.members;

      // Fetch user details for the team members
      const teamUserDetails = await db.User.findAll({
        attributes: ['id', 'name', 'email', 'image', 'entityname'],
        where: { id: { [Op.in]: teamMemberIds } },
        raw: true
      });

      // Add team members to the groupMembers array if found
      if (teamUserDetails.length > 0) {
        groupMembers.push(...teamUserDetails);
      }
    }

    // Filter out users with entityname: null
    groupMembers = groupMembers.filter(member => member.entityname !== null);

    // Fetch user details for the user with the UserId from the meeting table
    const meetingUser = await db.User.findOne({
      attributes: ['id', 'name', 'email', 'image', 'entityname'],
      where: { id: meeting.UserId },
      raw: true
    });

    // Add the meetingUser to the groupMembers array if not already included and entityname is not null
    if (meetingUser && meetingUser.entityname !== null && !groupMembers.some(member => member.id === meetingUser.id)) {
      groupMembers.push(meetingUser);
    }

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
      group: groupMembers, // Include group field with all members associated with the task's meeting, including additional users based on EntityId and team members
      date: subTask.date,
      meetingnumber: subTask.meetingnumber,
      meetingnumber: meeting ? meeting.meetingnumber : null,
      date: meeting ? meeting.date : null,
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

  const taskId = req.params.id;

  for (const key in restQueries) {
    filters[key] = restQueries[key];
  }
  const offset = (parseInt(page) - 1) * parseInt(pageSize);
  var { count, rows } = await db.SubTask.findAndCountAll({
    where: {
      TaskId: taskId
    },
    order: [['createdAt', 'DESC']],
    raw: true
  });

  // new
  // Fetch the task details
  const task = await db.Task.findOne({
    where: { id: taskId },
  });

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // Extracting meetingId from task
  const meetingId = parseInt(task.meetingId);

  // Fetch the meeting details
  const meeting = await db.Meeting.findOne({
    attributes: ['members', 'date', 'UserId', 'EntityId', 'TeamId', 'meetingnumber'], // Include TeamId in the attributes
    where: { id: meetingId },
    raw: true
  });

  if (!meeting) {
    return res.status(404).json({ error: 'Meeting not found' });
  }

  // Extract member IDs from the meeting
  const memberIds = meeting.members;

  // Fetch user details for the members
  let groupMembers = await db.User.findAll({
    attributes: ['id', 'name', 'email', 'image', 'entityname'],
    where: { id: { [Op.in]: memberIds } },
    raw: true
  });



  // Fetch additional users based on EntityId from the meeting
  const additionalUsers = await db.User.findAll({
    attributes: ['id', 'name', 'email', 'image', 'entityname'],
    where: { entityname: meeting.EntityId }, // Fetch users based on EntityId from meeting
    raw: true
  });

  // Add additional users to the groupMembers array if found
  if (additionalUsers.length > 0) {
    groupMembers.push(...additionalUsers);
  }

  // Fetch additional users based on TeamId from the meeting
  if (meeting.TeamId) {
    const teamMembers = await db.Team.findOne({
      attributes: ['id', 'members'],
      where: { id: meeting.TeamId }, // Fetch team based on TeamId from meeting
      raw: true
    });

    // Extract member IDs from the team
    const teamMemberIds = teamMembers.members;

    // Fetch user details for the team members
    const teamUserDetails = await db.User.findAll({
      attributes: ['id', 'name', 'email', 'image', 'entityname'],
      where: { id: { [Op.in]: teamMemberIds } },
      raw: true
    });

    // Add team members to the groupMembers array if found
    if (teamUserDetails.length > 0) {
      groupMembers.push(...teamUserDetails);
    }
  }

  // Filter out users with entityname: null
  groupMembers = groupMembers.filter(member => member.entityname !== null);

  // Fetch user details for the user with the UserId from the meeting table
  const meetingUser = await db.User.findOne({
    attributes: ['id', 'name', 'email', 'image', 'entityname'],
    where: { id: meeting.UserId },
    raw: true
  });

  // Add the meetingUser to the groupMembers array if not already included and entityname is not null
  if (meetingUser && meetingUser.entityname !== null && !groupMembers.some(member => member.id === meetingUser.id)) {
    groupMembers.push(meetingUser);
  }

  // Attach groupMembers to each SubTask
  rows = rows.map(row => ({
    ...row,
    group: groupMembers,
    meetingnumber: meeting ? meeting.meetingnumber : null,
    date: meeting ? meeting.date : null,
  }));


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
      const result = await uploadToS3(req.file);

      data = {
        file: `${result.Location}`,
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

const patchTskDoc = async (req, res) => {
  try {
    const updateData = req.body;
    let file = req.file;

    if (file) {
      const result = await uploadToS3(req.file);
      updateData = {
        file: `${result.Location}`,
        ...updateData,
      }
    }
    const updatedTask = await db.SubTaskDoc.update(updateData, {
      where: { id: req.params.id }
    });
    res.status(200).json({ message: "successfully updated", updatedTask })
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).send("Error updating task");
  }
}

const DeleteTskDoc = async (req, res) => {
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

const GetTask = async (req, res) => {
  const { userId, meetingId, status, entityId, teamId, runningdecisions } = req.query;
  const fromDate = req.query.fromDate;
  const toDate = req.query.toDate;
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 items per page

  try {
    let whereClause = {};

    if (fromDate && toDate) {
      whereClause.dueDate = {
        [Op.between]: [fromDate, toDate]
      };
    }

    if (req.tasks) {
      const taskIds = req.tasks.map(task => task.id);
      whereClause.id = { [Op.in]: taskIds };
    } else {
      return res.status(403).json({ error: 'Unauthorized access to tasks' });
    }

    if (entityId) {
      let userEntities = await db.Meeting.findAll({
        where: { EntityId: entityId },
        raw: true,
        attributes: ['id']
      });
      const userEntityIds = userEntities.map(item => item.id);
      whereClause.meetingId = { [Op.in]: userEntityIds };
    }

    if (userId) {
      const userMeetings = await db.Meeting.findAll({
        where: { UserId: userId },
        raw: true,
      });
      const userMeetingIds = userMeetings.map(item => item.id);
      whereClause.meetingId = whereClause.meetingId
        ? { [Op.and]: [whereClause.meetingId, { [Op.in]: userMeetingIds }] }
        : { [Op.in]: userMeetingIds };
    }

    if (meetingId) {
      whereClause.meetingId = whereClause.meetingId
        ? { [Op.and]: [whereClause.meetingId, { [Op.eq]: meetingId }] }
        : meetingId;
    }

    if (teamId) {
      const teamMeetings = await db.Meeting.findAll({
        where: { TeamId: teamId },
        raw: true,
        attributes: ['id']
      });
      const teamMeetingIds = teamMeetings.map(item => item.id);
      whereClause.meetingId = whereClause.meetingId
        ? { [Op.and]: [whereClause.meetingId, { [Op.in]: teamMeetingIds }] }
        : { [Op.in]: teamMeetingIds };
    }

    if (status) {
      if (status === "Over-Due") {
        const currentDate = new Date().toISOString().slice(0, 10);
        whereClause.dueDate = { [Op.lt]: currentDate };
      } else {
        whereClause.status = status;
      }
    }

    if (status === 'runningdecisions') {
      const currentDate = new Date().toISOString().slice(0, 10);
      whereClause = {
        [Op.or]: [
          { status: { [Op.in]: ["To-Do", "In-Progress"] } },
          { dueDate: { [Op.lt]: currentDate } }
        ]
      };
    }

    let totalTasks = await db.Task.count({ where: whereClause });
    const offset = (page - 1) * pageSize;

    let tasks = await db.Task.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset: offset
    });

    const currentDate = new Date().toISOString().slice(0, 10);

    await Promise.all(tasks.map(async task => {
      if (task.dueDate && task.dueDate < currentDate && task.status !== "Completed") {
        task.stat = "Over-Due";
        await db.Task.update({ stat: "Over-Due" }, {
          where: { id: task.id }
        });
      }
    }));

    tasks = await db.Task.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset: offset
    });

    const totalPages = Math.ceil(totalTasks / pageSize);

    const meetingIds = tasks.map(task => task.meetingId);
    const meetings = await db.Meeting.findAll({
      attributes: ['id', 'date', 'meetingnumber', 'members', 'UserId', 'EntityId', 'TeamId'],
      where: { id: { [Op.in]: meetingIds } },
      raw: true
    });

    const taskIds = tasks.map(task => task.id);
    const subTaskResults = await db.SubTask.findAll({
      attributes: ['TaskId', [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'subtaskCount']],
      where: { TaskId: { [Op.in]: taskIds } },
      group: ['TaskId'],
      raw: true
    });

    const subTaskCounts = subTaskResults.reduce((acc, result) => {
      acc[result.TaskId] = result.subtaskCount;
      return acc;
    }, {});

    const userResults = await db.User.findAll({
      attributes: ['id', 'name', 'email', 'image', 'entityname'],
      raw: true
    });

    const userMap = userResults.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {});

    const entityUserMap = userResults.reduce((acc, user) => {
      if (!acc[user.entityname]) {
        acc[user.entityname] = [];
      }
      acc[user.entityname].push(user);
      return acc;
    }, {});

    const teamIds = [...new Set(meetings.map(meeting => meeting.TeamId))];
    if (teamId) teamIds.push(teamId);

    const teams = await db.Team.findAll({
      where: { id: { [Op.in]: teamIds } },
      raw: true
    });

    const teamMap = teams.reduce((acc, team) => {
      acc[team.id] = team;
      return acc;
    }, {});

    if (teamId && teamMap[teamId] && teamMap[teamId].members) {
      const teamMembers = teamMap[teamId].members;
      const teamMemberIds = Array.isArray(teamMembers) ? teamMembers : [];

      const additionalUsers = await db.User.findAll({
        where: { id: { [Op.in]: teamMemberIds } },
        attributes: ['id', 'name', 'email', 'image', 'entityname'],
        raw: true
      });

      additionalUsers.forEach(user => {
        if (!userMap[user.id]) {
          userMap[user.id] = user;
        }
      });
    }

    const meetingMembersMap = meetings.reduce((acc, meeting) => {
      let members = meeting.members || [];
      let memberDetails = [];

      if (meeting.UserId && userMap[meeting.UserId]) {
        memberDetails.push(userMap[meeting.UserId]);
      }
      if (meeting.EntityId && entityUserMap[meeting.EntityId]) {
        memberDetails.push(...entityUserMap[meeting.EntityId]);
      }
      if (meeting.TeamId && teamMap[meeting.TeamId] && teamMap[meeting.TeamId].members) {
        let teamMembers = teamMap[meeting.TeamId].members;
        if (Array.isArray(teamMembers) && teamMembers.length > 0 && typeof teamMembers[0] === 'number') {
          memberDetails.push(...teamMembers.map(id => userMap[id]).filter(user => user));
        } else {
          memberDetails.push(...teamMembers);
        }
      }

      if (Array.isArray(members) && members.length > 0 && typeof members[0] === 'number') {
        memberDetails.push(...members.map(id => userMap[id]).filter(user => user));
      } else {
        memberDetails.push(...members);
      }

      acc[meeting.id] = memberDetails;
      return acc;
    }, {});

    let self = null;
    if (userId) {
      self = await db.User.findOne({
        attributes: ['id', 'image', 'name', 'email', 'entityname'],
        where: { id: userId },
        raw: true,
      });
    }

    const subTaskDocs = await db.SubTaskDoc.findAll({
      attributes: ['TaskId', [db.sequelize.fn('MAX', db.sequelize.col('createdAt')), 'latestMessageDate']],
      where: { TaskId: { [Op.in]: taskIds } },
      group: ['TaskId'],
      raw: true
    });

    const subTaskMessages = await db.SubTaskDoc.findAll({
      where: {
        [Op.or]: subTaskDocs.map(doc => ({
          TaskId: doc.TaskId,
          createdAt: doc.latestMessageDate
        }))
      },
      attributes: ['TaskId', 'message'],
      raw: true
    });

    const subTaskMessageMap = subTaskMessages.reduce((acc, message) => {
      acc[message.TaskId] = message.message;
      return acc;
    }, {});

    const combinedResult = await Promise.all(tasks.map(async task => {
      const subtaskCount = subTaskCounts[task.id] || 0;
      const members = meetingMembersMap[task.meetingId] || [];
      const memberdata = members[0];

      const uniqueMemberIds = new Set();
      const uniqueMembers = [];

      if (self && !uniqueMemberIds.has(self.id)) {
        uniqueMemberIds.add(self.id);
        uniqueMembers.push(self);
      }

      members.forEach(member => {
        if (!uniqueMemberIds.has(member.id)) {
          uniqueMemberIds.add(member.id);
          uniqueMembers.push(member);
        }
      });

      let createdAtTime = new Date(task.createdAt);
      let cTime = new Date();
      let timeDiff = cTime.getTime() - createdAtTime.getTime();
      let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      task.age = diffDays;

      const meeting = meetings.find(m => String(m.id) === String(task.meetingId));
      const meetingNumber = meeting ? meeting.meetingnumber : null;
      const meetingdate = meeting ? meeting.date : null;

      let memberdataFinal = null;
      if (task.members) {
        memberdataFinal = userMap[task.members].name || null;
      }

      let jsonObject = JSON.parse(task.taskCreatedBy);
      let taskCreatorName = '';
      if (task.taskCreatedBy && jsonObject.name == "teams") {
        const team = await db.Team.findOne({
          attributes: ['name'],
          where: { id: jsonObject.id },
          raw: true
        });
        taskCreatorName = team ? team.name : '';
      } else if (task.taskCreatedBy && jsonObject.name == "entities") {
        const entity = await db.Entity.findOne({
          attributes: ['name'],
          where: { id: jsonObject.id },
          raw: true
        });
        taskCreatorName = entity ? entity.name : '';
      }
      return {
        id: task.id,
        decision: task.decision,
        age: task.age,
        blongsTo: taskCreatorName,
        createdBy: jsonObject,
        meetingId: task.meetingId,
        date: meetingdate,
        priority: task.priority,
        group: uniqueMembers,
        dueDate: task.dueDate,
        members: task.members,
        status: task.status,
        stat: task.stat,
        memberdata: memberdataFinal,
        collaborators: task.collaborators || [],
        taskCreateby: task.taskCreateby,
        meetingNumber: meetingNumber,
        file: task.file,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        subtaskCount: subtaskCount,
        createdby: task.createdby,
        updatedbyuser: subTaskMessageMap[task.id] || null
      };
    }));

    res.status(200).json({
      tasks: combinedResult,
      totalPages: totalPages,
      currentPage: page,
      pageSize: pageSize,
      totalTasks: totalTasks,
      startTasks: offset + 1,
      endTasks: Math.min(offset + pageSize, totalTasks)
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};



// Added Age on this

// const GetTask = async (req, res) => {
//   const { userId, meetingId, status, entityId, teamId, runningdecisions } = req.query;
//   const fromDate = req.query.fromDate;
//   const toDate = req.query.toDate;
//   const page = parseInt(req.query.page) || 1; // Default to page 1
//   const pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 items per page

//   try {
//     let whereClause = {};

//     if (fromDate && toDate) {
//       whereClause.dueDate = {
//         [Op.between]: [fromDate, toDate]
//       };
//     }

//     if (req.tasks) {
//       const taskIds = req.tasks.map(task => task.id);
//       whereClause.id = { [Op.in]: taskIds };
//     } else {
//       return res.status(403).json({ error: 'Unauthorized access to tasks' });
//     }

//     if (entityId) {
//       let userEntities = await db.Meeting.findAll({
//         where: { EntityId: entityId },
//         raw: true,
//         attributes: ['id']
//       });
//       const userEntityIds = userEntities.map(item => item.id);
//       whereClause.meetingId = { [Op.in]: userEntityIds };
//     }

//     if (userId) {
//       const userMeetings = await db.Meeting.findAll({
//         where: { UserId: userId },
//         raw: true,
//       });
//       const userMeetingIds = userMeetings.map(item => item.id);
//       whereClause.meetingId = whereClause.meetingId
//         ? { [Op.and]: [whereClause.meetingId, { [Op.in]: userMeetingIds }] }
//         : { [Op.in]: userMeetingIds };
//     }

//     if (meetingId) {
//       whereClause.meetingId = whereClause.meetingId
//         ? { [Op.and]: [whereClause.meetingId, { [Op.eq]: meetingId }] }
//         : meetingId;
//     }

//     if (teamId) {
//       const teamMeetings = await db.Meeting.findAll({
//         where: { TeamId: teamId },
//         raw: true,
//         attributes: ['id']
//       });
//       const teamMeetingIds = teamMeetings.map(item => item.id);
//       whereClause.meetingId = whereClause.meetingId
//         ? { [Op.and]: [whereClause.meetingId, { [Op.in]: teamMeetingIds }] }
//         : { [Op.in]: teamMeetingIds };
//     }

//     if (status) {
//       if (status === "Over-Due") {
//         const currentDate = new Date().toISOString().slice(0, 10);
//         // whereClause.stat = "Over-Due";
//         whereClause.dueDate = { [Op.lt]: currentDate };
//       } else {
//         whereClause.status = status;
//       }
//     }

//     // Include runningdecisions parameter
//     // if (status === 'runningdecisions') {
//     //   const currentDate = new Date().toISOString().slice(0, 10);
//     //   whereClause.status = {
//     //     [Op.in]: ["To-Do", "In-Progress"],

//     //   }
//     //   whereClause.dueDate = { [Op.lt]: currentDate };
//     //   ;
//     // }

//     if (status === 'runningdecisions') {
//       const currentDate = new Date().toISOString().slice(0, 10);
//       whereClause = {
//         [Op.or]: [
//           { status: { [Op.in]: ["To-Do", "In-Progress"] } },
//           { dueDate: { [Op.lt]: currentDate } }
//         ]
//       };
//     }

//     // Get the total count of tasks matching the main filters
//     let totalTasks = await db.Task.count({ where: whereClause });
//     const offset = (page - 1) * pageSize;

//     let tasks = await db.Task.findAll({
//       where: whereClause,
//       order: [['createdAt', 'DESC']],
//       limit: pageSize,
//       offset: offset
//     });

//     const currentDate = new Date().toISOString().slice(0, 10);

//     // Update tasks to "Over-Due" status if they are past due and not "Completed"
//     await Promise.all(tasks.map(async task => {
//       if (task.dueDate && task.dueDate < currentDate && task.status !== "Completed") {
//         task.stat = "Over-Due";
//         await db.Task.update({ stat: "Over-Due" }, {
//           where: { id: task.id }
//         });
//       }
//     }));

//     // Refetch tasks to ensure updated status is included
//     tasks = await db.Task.findAll({
//       where: whereClause,
//       order: [['createdAt', 'DESC']],
//       limit: pageSize,
//       offset: offset
//     });

//     const totalPages = Math.ceil(totalTasks / pageSize);

//     const meetingIds = tasks.map(task => task.meetingId);
//     const meetings = await db.Meeting.findAll({
//       attributes: ['id', 'date', 'meetingnumber', 'members', 'UserId', 'EntityId', 'TeamId'],
//       where: { id: { [Op.in]: meetingIds } },
//       raw: true
//     });

//     const taskIds = tasks.map(task => task.id);
//     const subTaskResults = await db.SubTask.findAll({
//       attributes: ['TaskId', [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'subtaskCount']],
//       where: { TaskId: { [Op.in]: taskIds } },
//       group: ['TaskId'],
//       raw: true
//     });

//     const subTaskCounts = subTaskResults.reduce((acc, result) => {
//       acc[result.TaskId] = result.subtaskCount;
//       return acc;
//     }, {});

//     const userResults = await db.User.findAll({
//       attributes: ['id', 'name', 'email', 'image', 'entityname'],
//       raw: true
//     });

//     const userMap = userResults.reduce((acc, user) => {
//       acc[user.id] = user;
//       return acc;
//     }, {});

//     const entityUserMap = userResults.reduce((acc, user) => {
//       if (!acc[user.entityname]) {
//         acc[user.entityname] = [];
//       }
//       acc[user.entityname].push(user);
//       return acc;
//     }, {});

//     const teamIds = [...new Set(meetings.map(meeting => meeting.TeamId))];
//     if (teamId) teamIds.push(teamId);

//     const teams = await db.Team.findAll({
//       where: { id: { [Op.in]: teamIds } },
//       raw: true
//     });

//     const teamMap = teams.reduce((acc, team) => {
//       acc[team.id] = team;
//       return acc;
//     }, {});

//     if (teamId && teamMap[teamId] && teamMap[teamId].members) {
//       const teamMembers = teamMap[teamId].members;
//       const teamMemberIds = Array.isArray(teamMembers) ? teamMembers : [];

//       const additionalUsers = await db.User.findAll({
//         where: { id: { [Op.in]: teamMemberIds } },
//         attributes: ['id', 'name', 'email', 'image', 'entityname'],
//         raw: true
//       });

//       additionalUsers.forEach(user => {
//         if (!userMap[user.id]) {
//           userMap[user.id] = user;
//         }
//       });
//     }

//     const meetingMembersMap = meetings.reduce((acc, meeting) => {
//       let members = meeting.members || [];
//       let memberDetails = [];

//       if (meeting.UserId && userMap[meeting.UserId]) {
//         memberDetails.push(userMap[meeting.UserId]);
//       }
//       if (meeting.EntityId && entityUserMap[meeting.EntityId]) {
//         memberDetails.push(...entityUserMap[meeting.EntityId]);
//       }
//       if (meeting.TeamId && teamMap[meeting.TeamId] && teamMap[meeting.TeamId].members) {
//         let teamMembers = teamMap[meeting.TeamId].members;
//         if (Array.isArray(teamMembers) && teamMembers.length > 0 && typeof teamMembers[0] === 'number') {
//           memberDetails.push(...teamMembers.map(id => userMap[id]).filter(user => user));
//         } else {
//           memberDetails.push(...teamMembers);
//         }
//       }

//       if (Array.isArray(members) && members.length > 0 && typeof members[0] === 'number') {
//         memberDetails.push(...members.map(id => userMap[id]).filter(user => user));
//       } else {
//         memberDetails.push(...members);
//       }

//       acc[meeting.id] = memberDetails;
//       return acc;
//     }, {});

//     let self = null;
//     if (userId) {
//       self = await db.User.findOne({
//         attributes: ['id', 'image', 'name', 'email', 'entityname'],
//         where: { id: userId },
//         raw: true,
//       });
//     }

//     // Fetch the latest message for each task
//     const subTaskDocs = await db.SubTaskDoc.findAll({
//       attributes: ['TaskId', [db.sequelize.fn('MAX', db.sequelize.col('createdAt')), 'latestMessageDate']],
//       where: { TaskId: { [Op.in]: taskIds } },
//       group: ['TaskId'],
//       raw: true
//     });

//     const subTaskMessages = await db.SubTaskDoc.findAll({
//       where: {
//         [Op.or]: subTaskDocs.map(doc => ({
//           TaskId: doc.TaskId,
//           createdAt: doc.latestMessageDate
//         }))
//       },
//       attributes: ['TaskId', 'message'],
//       raw: true
//     });

//     const subTaskMessageMap = subTaskMessages.reduce((acc, message) => {
//       acc[message.TaskId] = message.message;
//       return acc;
//     }, {});

//     const combinedResult = tasks.map(task => {
//       const subtaskCount = subTaskCounts[task.id] || 0;
//       const members = meetingMembersMap[task.meetingId] || [];
//       const memberdata = members[0];

//       const uniqueMemberIds = new Set();
//       const uniqueMembers = [];

//       if (self && !uniqueMemberIds.has(self.id)) {
//         uniqueMemberIds.add(self.id);
//         uniqueMembers.push(self);
//       }

//       members.forEach(member => {
//         if (!uniqueMemberIds.has(member.id)) {
//           uniqueMemberIds.add(member.id);
//           uniqueMembers.push(member);
//         }
//       });

//       let createdAtTime = new Date(task.createdAt);
//       let cTime = new Date();
//       let timeDiff = cTime.getTime() - createdAtTime.getTime();
//       let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
//       task.age =diffDays




//       const meeting = meetings.find(m => String(m.id) === String(task.meetingId));
//       const meetingNumber = meeting ? meeting.meetingnumber : null;
//       const meetingdate = meeting ? meeting.date : null;

//       let memberdataFinal = null;
//       if (task.members) {
//         memberdataFinal = userMap[task.members].name || null;
//       }

//       return {
//         id: task.id,
//         decision: task.decision,
//         meetingId: task.meetingId,
//         date: meetingdate,
//         priority: task.priority,
//         group: uniqueMembers,
//         dueDate: task.dueDate,
//         age : task.age,
//         members: task.members,
//         status: task.status,
//         stat: task.stat,
//         memberdata: memberdataFinal,
//         collaborators: task.collaborators || [],
//         taskCreateby: task.taskCreateby,
//         meetingNumber: meetingNumber,
//         file: task.file,
//         createdAt: task.createdAt,
//         updatedAt: task.updatedAt,
//         subtaskCount: subtaskCount,
//         createdby: task.createdby,
//         updatedbyuser: subTaskMessageMap[task.id] || null
//       };
//     });

//     res.status(200).json({
//       tasks: combinedResult,
//       totalPages: totalPages,
//       currentPage: page,
//       pageSize: pageSize,
//       totalTasks: totalTasks,
//       startTasks: offset + 1,
//       endTasks: Math.min(offset + pageSize, totalTasks)
//     });
//   } catch (error) {
//     console.error('Error fetching tasks:', error);
//     res.status(500).json({ error: 'Failed to fetch tasks' });
//   }
// };

// const GetTask = async (req, res) => {
//   const { userId, meetingId, status, entityId, teamId } = req.query;
//   const fromDate = req.query.fromDate;
//   const toDate = req.query.toDate;
//   const page = parseInt(req.query.page) || 1; // Default to page 1
//   const pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 items per page

//   try {
//     let whereClause = {};

//     if (fromDate && toDate) {
//       whereClause.dueDate = {
//         [Op.between]: [fromDate, toDate]
//       };
//     }

//     if (req.tasks) {
//       const taskIds = req.tasks.map(task => task.id);
//       // console.log("Authorized Task IDs:", taskIds);
//       whereClause.id = { [Op.in]: taskIds };
//     } else {
//       // console.log("No authorized tasks found in req.tasks");
//       return res.status(403).json({ error: 'Unauthorized access to tasks' });
//     }

//     if (entityId) {
//       let userEntities = await db.Meeting.findAll({
//         where: { EntityId: entityId },
//         raw: true,
//         attributes: ['id']
//       });
//       const userEntityIds = userEntities.map(item => item.id);
//       whereClause.meetingId = { [Op.in]: userEntityIds };
//     }

//     if (userId) {
//       const userMeetings = await db.Meeting.findAll({
//         where: { UserId: userId },
//         raw: true,
//       });
//       const userMeetingIds = userMeetings.map(item => item.id);
//       whereClause.meetingId = whereClause.meetingId
//         ? { [Op.and]: [whereClause.meetingId, { [Op.in]: userMeetingIds }] }
//         : { [Op.in]: userMeetingIds };
//     }

//     if (meetingId) {
//       whereClause.meetingId = whereClause.meetingId
//         ? { [Op.and]: [whereClause.meetingId, { [Op.eq]: meetingId }] }
//         : meetingId;
//     }

//     if (teamId) {
//       const teamMeetings = await db.Meeting.findAll({
//         where: { TeamId: teamId },
//         raw: true,
//         attributes: ['id']
//       });
//       const teamMeetingIds = teamMeetings.map(item => item.id);
//       whereClause.meetingId = whereClause.meetingId
//         ? { [Op.and]: [whereClause.meetingId, { [Op.in]: teamMeetingIds }] }
//         : { [Op.in]: teamMeetingIds };
//     }

//     if (status) {
//       if (status === "Over-Due") {
//         const currentDate = new Date().toISOString().slice(0, 10);
//         whereClause.stat = "Over-Due";
//         whereClause.dueDate = { [Op.lt]: currentDate };
//       } else {
//         whereClause.status = status;
//       }
//     }

//     // Get the total count of tasks matching the main filters
//     let totalTasks = await db.Task.count({ where: whereClause });
//     const offset = (page - 1) * pageSize;

//     let tasks = await db.Task.findAll({
//       where: whereClause,
//       order: [['createdAt', 'DESC']],
//       limit: pageSize,
//       offset: offset
//     });

//     const currentDate = new Date().toISOString().slice(0, 10);

//     // Update tasks to "Over-Due" status if they are past due and not "Completed"
//     await Promise.all(tasks.map(async task => {
//       if (task.dueDate && task.dueDate < currentDate && task.status !== "Completed") {
//         task.stat = "Over-Due";
//         await db.Task.update({ stat: "Over-Due" }, {
//           where: { id: task.id }
//         });
//       }
//     }));

//     // Refetch tasks to ensure updated status is included
//     tasks = await db.Task.findAll({
//       where: whereClause,
//       order: [['createdAt', 'DESC']],
//       limit: pageSize,
//       offset: offset
//     });

//     const totalPages = Math.ceil(totalTasks / pageSize);

//     const meetingIds = tasks.map(task => task.meetingId);
//     const meetings = await db.Meeting.findAll({
//       attributes: ['id', 'date', 'meetingnumber', 'members', 'UserId', 'EntityId', 'TeamId'],
//       where: { id: { [Op.in]: meetingIds } },
//       raw: true
//     });

//     // console.log("Meetings fetched:", meetings);
//     // console.log("Tasks fetched:", tasks);

//     const taskIds = tasks.map(task => task.id);
//     const subTaskResults = await db.SubTask.findAll({
//       attributes: ['TaskId', [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'subtaskCount']],
//       where: { TaskId: { [Op.in]: taskIds } },
//       group: ['TaskId'],
//       raw: true
//     });

//     const subTaskCounts = subTaskResults.reduce((acc, result) => {
//       acc[result.TaskId] = result.subtaskCount;
//       return acc;
//     }, {});

//     const userResults = await db.User.findAll({
//       attributes: ['id', 'name', 'email', 'image', 'entityname'],
//       raw: true
//     });

//     const userMap = userResults.reduce((acc, user) => {
//       acc[user.id] = user;
//       return acc;
//     }, {});

//     const entityUserMap = userResults.reduce((acc, user) => {
//       if (!acc[user.entityname]) {
//         acc[user.entityname] = [];
//       }
//       acc[user.entityname].push(user);
//       return acc;
//     }, {});

//     const teamIds = [...new Set(meetings.map(meeting => meeting.TeamId))];
//     if (teamId) teamIds.push(teamId);

//     const teams = await db.Team.findAll({
//       where: { id: { [Op.in]: teamIds } },
//       raw: true
//     });

//     const teamMap = teams.reduce((acc, team) => {
//       acc[team.id] = team;
//       return acc;
//     }, {});

//     if (teamId && teamMap[teamId] && teamMap[teamId].members) {
//       const teamMembers = teamMap[teamId].members;
//       const teamMemberIds = Array.isArray(teamMembers) ? teamMembers : [];

//       const additionalUsers = await db.User.findAll({
//         where: { id: { [Op.in]: teamMemberIds } },
//         attributes: ['id', 'name', 'email', 'image', 'entityname'],
//         raw: true
//       });

//       additionalUsers.forEach(user => {
//         if (!userMap[user.id]) {
//           userMap[user.id] = user;
//         }
//       });
//     }

//     const meetingMembersMap = meetings.reduce((acc, meeting) => {
//       let members = meeting.members || [];
//       let memberDetails = [];

//       if (meeting.UserId && userMap[meeting.UserId]) {
//         memberDetails.push(userMap[meeting.UserId]);
//       }
//       if (meeting.EntityId && entityUserMap[meeting.EntityId]) {
//         memberDetails.push(...entityUserMap[meeting.EntityId]);
//       }
//       if (meeting.TeamId && teamMap[meeting.TeamId] && teamMap[meeting.TeamId].members) {
//         let teamMembers = teamMap[meeting.TeamId].members;
//         if (Array.isArray(teamMembers) && teamMembers.length > 0 && typeof teamMembers[0] === 'number') {
//           memberDetails.push(...teamMembers.map(id => userMap[id]).filter(user => user));
//         } else {
//           memberDetails.push(...teamMembers);
//         }
//       }

//       if (Array.isArray(members) && members.length > 0 && typeof members[0] === 'number') {
//         memberDetails.push(...members.map(id => userMap[id]).filter(user => user));
//       } else {
//         memberDetails.push(...members);
//       }

//       acc[meeting.id] = memberDetails;
//       return acc;
//     }, {});

//     let self = null;
//     if (userId) {
//       self = await db.User.findOne({
//         attributes: ['id', 'image', 'name', 'email', 'entityname'],
//         where: { id: userId },
//         raw: true,
//       });
//     }

//     // Fetch the latest message for each task
//     const subTaskDocs = await db.SubTaskDoc.findAll({
//       attributes: ['TaskId', [db.sequelize.fn('MAX', db.sequelize.col('createdAt')), 'latestMessageDate']],
//       where: { TaskId: { [Op.in]: taskIds } },
//       group: ['TaskId'],
//       raw: true
//     });

//     const subTaskMessages = await db.SubTaskDoc.findAll({
//       where: {
//         [Op.or]: subTaskDocs.map(doc => ({
//           TaskId: doc.TaskId,
//           createdAt: doc.latestMessageDate
//         }))
//       },
//       attributes: ['TaskId', 'message'],
//       raw: true
//     });

//     const subTaskMessageMap = subTaskMessages.reduce((acc, message) => {
//       acc[message.TaskId] = message.message;
//       return acc;
//     }, {});

//     const combinedResult = tasks.map(task => {
//       const subtaskCount = subTaskCounts[task.id] || 0;
//       const members = meetingMembersMap[task.meetingId] || [];
//       const memberdata = members[0];

//       const uniqueMemberIds = new Set();
//       const uniqueMembers = [];

//       if (self && !uniqueMemberIds.has(self.id)) {
//         uniqueMemberIds.add(self.id);
//         uniqueMembers.push(self);
//       }

//       members.forEach(member => {
//         if (!uniqueMemberIds.has(member.id)) {
//           uniqueMemberIds.add(member.id);
//           uniqueMembers.push(member);
//         }
//       });

//       const meeting = meetings.find(m => String(m.id) === String(task.meetingId));
//       const meetingNumber = meeting ? meeting.meetingnumber : null;
//       const meetingdate = meeting ? meeting.date : null;

//       // Fetch user corresponding to `members` value
//       let memberdataFinal = null;
//       if (task.members) {
//         memberdataFinal = userMap[task.members].name || null;
//       }


//       return {
//         id: task.id,
//         decision: task.decision,
//         meetingId: task.meetingId,
//         date: meetingdate,
//         priority: task.priority,
//         group: uniqueMembers,
//         dueDate: task.dueDate,
//         members: task.members,
//         status: task.status,
//         stat: task.stat,
//         memberdata: memberdataFinal,
//         collaborators: task.collaborators || [],
//         taskCreateby: task.taskCreateby,
//         meetingNumber: meetingNumber,
//         file: task.file,
//         createdAt: task.createdAt,
//         updatedAt: task.updatedAt,
//         subtaskCount: subtaskCount,
//         createdby: task.createdby,
//         updatedbyuser: subTaskMessageMap[task.id] || null
//       };
//     });


//     res.status(200).json({
//       tasks: combinedResult,
//       totalPages: totalPages,
//       currentPage: page,
//       pageSize: pageSize,
//       totalTasks: totalTasks,
//       startTasks: offset + 1,
//       endTasks: Math.min(offset + pageSize, totalTasks)
//     });
//   } catch (error) {
//     console.error('Error fetching tasks:', error);
//     res.status(500).json({ error: 'Failed to fetch tasks' });
//   }
// };

//working code

// const GetTask = async (req, res) => {
//   const { userId, meetingId, status, entityId, teamId } = req.query;
//   const fromDate = req.query.fromDate;
//   const toDate = req.query.toDate;

//   try {
//     let whereClause = {};

//     if (fromDate && toDate) {
//       whereClause.dueDate = {
//         [Op.between]: [fromDate, toDate]
//       };
//     }

//     if (req.tasks) {
//       const taskIds = req.tasks.map(task => task.id);
//       console.log("Authorized Task IDs:", taskIds);
//       whereClause.id = { [Op.in]: taskIds };
//     } else {
//       console.log("No authorized tasks found in req.tasks");
//       return res.status(403).json({ error: 'Unauthorized access to tasks' });
//     }

//     if (entityId) {
//       let userEntities = await db.Meeting.findAll({
//         where: { EntityId: entityId },
//         raw: true,
//         attributes: ['id']
//       });
//       const userEntityIds = userEntities.map(item => item.id);
//       whereClause.meetingId = { [Op.in]: userEntityIds };
//     }

//     if (userId) {
//       const userMeetings = await db.Meeting.findAll({
//         where: { UserId: userId },
//         raw: true,
//       });
//       const userMeetingIds = userMeetings.map(item => item.id);
//       whereClause.meetingId = whereClause.meetingId
//         ? { [Op.and]: [whereClause.meetingId, { [Op.in]: userMeetingIds }] }
//         : { [Op.in]: userMeetingIds };
//     }

//     if (meetingId) {
//       whereClause.meetingId = whereClause.meetingId
//         ? { [Op.and]: [whereClause.meetingId, { [Op.eq]: meetingId }] }
//         : meetingId;
//     }

//     if (teamId) {
//       const teamMeetings = await db.Meeting.findAll({
//         where: { TeamId: teamId },
//         raw: true,
//         attributes: ['id']
//       });
//       const teamMeetingIds = teamMeetings.map(item => item.id);
//       whereClause.meetingId = whereClause.meetingId
//         ? { [Op.and]: [whereClause.meetingId, { [Op.in]: teamMeetingIds }] }
//         : { [Op.in]: teamMeetingIds };
//     }

//     let tasks = await db.Task.findAll({
//       where: whereClause,
//       order: [['createdAt', 'DESC']]
//     });

//     const currentDate = new Date().toISOString().slice(0, 10);

//     if (status) {
//       tasks = tasks.filter(task => {
//         if (status === "Over-Due") {
//           return task.dueDate && task.dueDate < currentDate && task.status !== "Completed";
//         }
//         return task.status === status;
//       });
//     }

//     await Promise.all(tasks.map(async task => {
//       if (task.dueDate && task.dueDate < currentDate && task.status !== "Completed") {
//         await db.Task.update({ stat: "Over-Due" }, {
//           where: { id: task.id }
//         });
//       }
//     }));

//     const meetingIds = tasks.map(task => task.meetingId);
//     const meetings = await db.Meeting.findAll({
//       attributes: ['id', 'date', 'meetingnumber', 'members', 'UserId', 'EntityId', 'TeamId'],
//       where: { id: { [Op.in]: meetingIds } },
//       raw: true
//     });

//     console.log("Meetings fetched:", meetings);
//     console.log("Tasks fetched:", tasks);

//     const taskIds = tasks.map(task => task.id);
//     const subTaskResults = await db.SubTask.findAll({
//       attributes: ['TaskId', [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'subtaskCount']],
//       where: { TaskId: { [Op.in]: taskIds } },
//       group: ['TaskId'],
//       raw: true
//     });

//     const subTaskCounts = subTaskResults.reduce((acc, result) => {
//       acc[result.TaskId] = result.subtaskCount;
//       return acc;
//     }, {});

//     const userResults = await db.User.findAll({
//       attributes: ['id', 'name', 'email', 'image', 'entityname'],
//       raw: true
//     });

//     const userMap = userResults.reduce((acc, user) => {
//       acc[user.id] = user;
//       return acc;
//     }, {});

//     const entityUserMap = userResults.reduce((acc, user) => {
//       if (!acc[user.entityname]) {
//         acc[user.entityname] = [];
//       }
//       acc[user.entityname].push(user);
//       return acc;
//     }, {});

//     const teamIds = [...new Set(meetings.map(meeting => meeting.TeamId))];
//     if (teamId) teamIds.push(teamId);

//     const teams = await db.Team.findAll({
//       where: { id: { [Op.in]: teamIds } },
//       raw: true
//     });

//     const teamMap = teams.reduce((acc, team) => {
//       acc[team.id] = team;
//       return acc;
//     }, {});

//     if (teamId && teamMap[teamId] && teamMap[teamId].members) {
//       const teamMembers = teamMap[teamId].members;
//       const teamMemberIds = Array.isArray(teamMembers) ? teamMembers : [];

//       const additionalUsers = await db.User.findAll({
//         where: { id: { [Op.in]: teamMemberIds } },
//         attributes: ['id', 'name', 'email', 'image', 'entityname'],
//         raw: true
//       });

//       additionalUsers.forEach(user => {
//         if (!userMap[user.id]) {
//           userMap[user.id] = user;
//         }
//       });
//     }

//     const meetingMembersMap = meetings.reduce((acc, meeting) => {
//       let members = meeting.members || [];
//       let memberDetails = [];

//       if (meeting.UserId && userMap[meeting.UserId]) {
//         memberDetails.push(userMap[meeting.UserId]);
//       }
//       if (meeting.EntityId && entityUserMap[meeting.EntityId]) {
//         memberDetails.push(...entityUserMap[meeting.EntityId]);
//       }
//       if (meeting.TeamId && teamMap[meeting.TeamId] && teamMap[meeting.TeamId].members) {
//         let teamMembers = teamMap[meeting.TeamId].members;
//         if (Array.isArray(teamMembers) && teamMembers.length > 0 && typeof teamMembers[0] === 'number') {
//           memberDetails.push(...teamMembers.map(id => userMap[id]).filter(user => user));
//         } else {
//           memberDetails.push(...teamMembers);
//         }
//       }

//       if (Array.isArray(members) && members.length > 0 && typeof members[0] === 'number') {
//         memberDetails.push(...members.map(id => userMap[id]).filter(user => user));
//       } else {
//         memberDetails.push(...members);
//       }

//       acc[meeting.id] = memberDetails;
//       return acc;
//     }, {});

//     let self = null;
//     if (userId) {
//       self = await db.User.findOne({
//         attributes: ['id', 'image', 'name', 'email', 'entityname'],
//         where: { id: userId },
//         raw: true,
//       });
//     }

//     // Fetch the latest message for each task
//     const subTaskDocs = await db.SubTaskDoc.findAll({
//       attributes: ['TaskId', [db.sequelize.fn('MAX', db.sequelize.col('createdAt')), 'latestMessageDate']],
//       where: { TaskId: { [Op.in]: taskIds } },
//       group: ['TaskId'],
//       raw: true
//     });

//     const subTaskMessages = await db.SubTaskDoc.findAll({
//       where: {
//         [Op.or]: subTaskDocs.map(doc => ({
//           TaskId: doc.TaskId,
//           createdAt: doc.latestMessageDate
//         }))
//       },
//       attributes: ['TaskId', 'message'],
//       raw: true
//     });

//     const subTaskMessageMap = subTaskMessages.reduce((acc, message) => {
//       acc[message.TaskId] = message.message;
//       return acc;
//     }, {});

//     const combinedResult = tasks.map(task => {
//       const subtaskCount = subTaskCounts[task.id] || 0;
//       const members = meetingMembersMap[task.meetingId] || [];
//       const memberdata = members[0]

//       const uniqueMemberIds = new Set();
//       const uniqueMembers = [];

//       if (self && !uniqueMemberIds.has(self.id)) {
//         uniqueMemberIds.add(self.id);
//         uniqueMembers.push(self);
//       }

//       members.forEach(member => {
//         if (!uniqueMemberIds.has(member.id)) {
//           uniqueMemberIds.add(member.id);
//           uniqueMembers.push(member);
//         }
//       });

//       const meeting = meetings.find(m => String(m.id) === String(task.meetingId));
//       const meetingNumber = meeting ? meeting.meetingnumber : null;
//       const meetingdate = meeting ? meeting.date : null;

//       if (!meeting) {
//         console.log(`Meeting not found for Task ID: ${task.id}, Meeting ID: ${task.meetingId}`);
//       } else if (meetingNumber === null) {
//         console.log(`Meeting number is null for Meeting ID: ${meeting.id}`);
//       }

//       return {
//         id: task.id,
//         decision: task.decision,
//         meetingId: task.meetingId,
//         date: meetingdate,
//         priority: task.priority,
//         group: uniqueMembers,
//         dueDate: task.dueDate,
//         members: task.members,
//         status: task.status,
//         stat: task.stat,
//         memberdata:memberdata,

//         collaborators: task.collaborators || [],
//         taskCreateby: task.taskCreateby,
//         meetingNumber: meetingNumber,

//         file: task.file,
//         createdAt: task.createdAt,
//         updatedAt: task.updatedAt,
//         subtaskCount: subtaskCount,
//         createdby: task.createdby,
//         updatedbyuser: subTaskMessageMap[task.id] || null
//       };
//     });

//     res.status(200).json(combinedResult);
//   } catch (error) {
//     console.error('Error fetching tasks:', error);
//     res.status(500).json({ error: 'Failed to fetch tasks' });
//   }
// };

// back up
// const ListTaskCount = async (req, res) => {
//   try {
//     let whereClause = {};

//     // Use authorized tasks from req.tasks
//     if (req.tasks && req.tasks.length > 0) {
//       const taskIds = req.tasks.map(task => task.id);
//       // console.log("Authorized Task IDs:", taskIds);
//       whereClause.id = { [Op.in]: taskIds };
//     } else {
//       // console.log("No authorized tasks found in req.tasks");
//       return res.status(403).json({ error: 'Unauthorized access to tasks' });
//     }

//     // Define the possible statuses
//     const statuses = ["To-Do", "In-Progress", "Over-Due", "Completed"];

//     // Initialize an object to hold the counts
//     const taskCounts = {
//       allTasksCount: 0,
//       toDoCount: 0,
//       inProgressCount: 0,
//       overdueCount: 0,
//       completedCount: 0
//     };

//     // Count all tasks
//     taskCounts.allTasksCount = await db.Task.count({
//       where: whereClause
//     });

//     // // Count Over-Due tasks separately
//     // taskCounts.overdueCount = await db.Task.count({
//     //   where: {
//     //     ...whereClause,
//     //     dueDate: { [Op.lt]: moment().startOf('day').toDate() }, // Check if due date is before today
//     //     status: { [Op.ne]: "Completed" } // Ensure it's not completed
//     //   }
//     // });
//     // Count Over-Due tasks separately
//     taskCounts.overdueCount = await db.Task.count({
//       where: {
//         ...whereClause,
//         dueDate: { [Op.lt]: moment().startOf('day').toDate() }, // Check if due date is before today
//         // status: { [Op.ne]: "Completed" } // Ensure it's not completed
//         stat: { [Op.ne]: "Over-Due" } // Ensure it's not completed
//       }
//     });

//     // Count tasks by status excluding Over-Due tasks
//     for (const status of statuses) {
//       if (status !== "Over-Due") {
//         const count = await db.Task.count({
//           where: {
//             ...whereClause,
//             status,
//             dueDate: { [Op.gte]: moment().startOf('day').toDate() }, // Ensure due date is not before today
//             dueDate: null,
//           }
//         });

//         switch (status) {
//           case "To-Do":
//             taskCounts.toDoCount = count;
//             break;
//           case "In-Progress":
//             taskCounts.inProgressCount = count;
//             break;
//           case "Completed":
//             taskCounts.completedCount = count;
//             break;
//         }
//       }
//     }

//     // Send the response
//     res.json(taskCounts);
//   } catch (error) {
//     console.error('Error fetching task counts:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };


// const ListTaskCount = async (req, res) => {
//   try {
//     let whereClause = {};

//     // Use authorized tasks from req.tasks
//     if (req.tasks && req.tasks.length > 0) {
//       const taskIds = req.tasks.map(task => task.id);
//       whereClause.id = { [Op.in]: taskIds };
//     } else {
//       return res.status(403).json({ error: 'Unauthorized access to tasks' });
//     }

//     // Define the possible statuses
//     const statuses = ["To-Do", "In-Progress", "Completed"];

//     // Initialize an object to hold the counts
//     const taskCounts = {
//       allTasksCount: 0,
//       toDoCount: 0,
//       inProgressCount: 0,
//       overdueCount: 0,
//       completedCount: 0
//     };

//     // Count all tasks
//     taskCounts.allTasksCount = await db.Task.count({
//       where: whereClause
//     });

//     // Count Over-Due tasks separately
//     taskCounts.overdueCount = await db.Task.count({
//       where: {
//         ...whereClause,
//         dueDate: { [Op.lt]: moment().startOf('day').toDate() },
//         status: { [Op.ne]: "Completed" }
//       }
//     });

//     // Count tasks by status excluding Over-Due tasks
//     for (const status of statuses) {
//       const count = await db.Task.count({
//         where: {
//           ...whereClause,
//           status,
//           dueDate: { [Op.gte]: moment().startOf('day').toDate() }
//         }
//       });

//       switch (status) {
//         case "To-Do":
//           taskCounts.toDoCount = count;
//           break;
//         case "In-Progress":
//           taskCounts.inProgressCount = count;
//           break;
//         case "Completed":
//           taskCounts.completedCount = count;
//           break;
//       }
//     }

//     // Send the response
//     res.json(taskCounts);
//   } catch (error) {
//     console.error('Error fetching task counts:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };


const ListTaskCount = async (req, res) => {
  try {
    let whereClause = {};

    // // Use authorized tasks from req.tasks
    // if (req.tasks && req.tasks.length > 0) {
    //   const taskIds = req.tasks.map(task => task.id);
    //   whereClause.id = { [Op.in]: taskIds };
    // } else {
    //   return res.status(403).json({ error: 'Unauthorized access to tasks' });
    // }

    // Use authorized tasks from req.tasks
    if (req.tasks && req.tasks.length > 0) {
      const taskIds = req.tasks.map(task => task.id);
      whereClause.id = { [Op.in]: taskIds };
    } else {
      // If the user has no authorized tasks, return zero counts for all task categories
      return res.json({
        allTasksCount: 0,
        toDoCount: 0,
        inProgressCount: 0,
        overdueCount: 0,
        completedCount: 0
      });
    }

    // Define the possible statuses
    const statuses = ["To-Do", "In-Progress", "Completed"];

    // Initialize an object to hold the counts
    const taskCounts = {
      allTasksCount: 0,
      toDoCount: 0,
      inProgressCount: 0,
      overdueCount: 0,
      completedCount: 0
    };

    // Count all tasks
    taskCounts.allTasksCount = await db.Task.count({
      where: whereClause
    });

    // Count Over-Due tasks separately
    taskCounts.overdueCount = await db.Task.count({
      where: {
        ...whereClause,
        dueDate: { [Op.lt]: moment().startOf('day').toDate() },
        status: { [Op.ne]: "Completed" }
      }
    });

    // Count tasks by status excluding Over-Due tasks
    for (const status of statuses) {
      const count = await db.Task.count({
        where: {
          ...whereClause,
          status,
          [Op.or]: [
            { dueDate: { [Op.gte]: moment().startOf('day').toDate() } },
            { dueDate: null }
          ]
        }
      });

      switch (status) {
        case "To-Do":
          taskCounts.toDoCount = count;
          break;
        case "In-Progress":
          taskCounts.inProgressCount = count;
          break;
        case "Completed":
          taskCounts.completedCount = count;
          break;
      }
    }

    // Send the response
    res.json(taskCounts);
  } catch (error) {
    console.error('Error fetching task counts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




const GetTaskbyEntity = async (req, res) => {
  let = entityId = req.params.id
  const teamMembers = await db.Meeting.findAll({
    where: { EntityId: entityId }, // Fetch team based on TeamId from meeting
    raw: true
  });
  const memberIds = teamMembers.map(member => member.id); // Assuming the ID field in teamMembers is 'id'
  let groupMembers = await db.Task.findAll({
    where: { meetingId: { [Op.in]: memberIds } },
    raw: true
  });

  res.status(200).json(groupMembers);
};


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
  ListTaskCount,
  DeleteTskDoc,
  GetTaskbyEntity
};



