var db = require('../models/index');
const mycon = require('../DB/mycon');
const transporter = require('../utils/nodemailer')
const { Op, where, Sequelize } = require('sequelize');
const uploadToS3 = require('../utils/wearhouse')



const CreateTask = async (req, res) => {
  try {
    let file = req.file;
    var data = req.body;
    let {createdby,collaborators,taskCreatedBy} = req.body
    let bmId = req.params.id;

    // const CollaboratorsString = JSON.stringify(Collaborators);


    if (file) {
      const result = await uploadToS3(req.file);
      data = {
        image: `${result.Location}`,
        ...data
      }
    }
    let task = await db.Task.create({ meetingId: bmId,createdby:createdby, collaborators : collaborators,taskCreateby:taskCreatedBy  }, data);

    res.status(201).send(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).send("Error creating task");
  }
};

// VVO
// const GetTaskbyId = async (req, res) => {
//   const taskId = req.params.id;
//   try {
//     // Fetch the task details
//     const tasks = await db.Task.findAll({
//       where: { id: taskId },
//     });

//     if (!tasks || tasks.length === 0) {
//       return res.status(404).json({ error: 'Task not found' });
//     }

//     const task = tasks[0];

//     // Extracting meetingId from task
//     const meetingId = parseInt(task.meetingId);

//     // Fetch the meeting details
//     const meeting = await db.Meeting.findOne({
//       attributes: ['id', 'date', 'meetingnumber'],
//       where: {
//         id: meetingId
//       },
//       raw: true
//     });

//     // Fetch task comments for the given task
//     const taskComments = await db.SubTaskDoc.findAll({
//       where: {
//         TaskId: taskId
//       },
//       raw: true
//     });

//     // Extract unique userIds from comments
//     const userIds = [...new Set(taskComments.map(item => parseInt(item.senderId)))];

//     // Fetch user details based on userIds
//     const users = await db.User.findAll({
//       attributes: ['id', 'image', 'name'],
//       where: {
//         id: { [Op.in]: userIds }
//       },
//       raw: true
//     });

//     let {count} = await db.SubTask.findAndCountAll({
//       where: {
//         TaskId: taskId },
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

//     // Prepare the response data
//     const combinedResult = {
//       id: task.id,
//       decision: task.decision,
//       SubTaskCount : count,
//       date: meeting ? meeting.date : null,
//       taskCreateby: "", // Initialize taskCreateby as empty string
//       meetingnumber: meeting ? meeting.meetingnumber : null,
//       priority: task.priority || null, // Use task priority or null if undefined
//       members: task.members,
//       collaborators: "",
//       dueDate: task.dueDate,
//       status: task.status,
//       createdAt: task.createdAt,
//       updatedAt: task.updatedAt,
//       file: task.file || null, // Use task file or null if undefined
//       comments: commentsWithUserInfo || [] // Use comments array or empty array if undefined
//     };

//     // Fetch task creator entity name
//     const taskCreator = task.taskCreateby;
//     if (taskCreator && taskCreator.name === "users") {
//       const userEntity = await db.User.findOne({ 
//         attributes: ['EntityId'],
//         where: { id: taskCreator.id }
//       });
//       if (userEntity) {
//         const EntID = userEntity.EntityId;
//         const entity = await db.Entity.findOne({ 
//           attributes: ['name'],
//           where: { id: EntID }
//         });
//       if(task.collaborators){
//          var colabs = await db.User.findAll({
//           attributes: ['id', 'name','image','email','EntityId'],
//           where: {
//             id: { [Op.in]: task.collaborators }
//           },
//           raw: true
//         });
//       }
//       combinedResult.taskCreateby = entity ? entity.name : "";
//       combinedResult.collaborators = colabs;

//       }
//     }
//     else if (taskCreator && taskCreator.name === "entity"){
//       const entity = await db.Entity.findOne({ 
//         attributes: ['name'],
//         where: { id: taskCreator.id }
//       });
//       combinedResult.taskCreateby = entity ? entity.name : "";
//       combinedResult.collaborators = task ? task.collaborators : "";

//     }
//     else if (taskCreator && taskCreator.name === "team"){
//       const entity = await db.Team.findOne({ 
//         attributes: ['name'],
//         where: { id: taskCreator.id }
//       });
//       combinedResult.taskCreateby = entity ? entity.name : "";
//       combinedResult.collaborators = task ? task.collaborators : "";

//     }

//     res.status(200).json([combinedResult]); // Wrap result in an array to match the specified format
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
//       attributes: ['members'],
//       where: { id: meetingId },
//       raw: true
//     });

//     if (!meeting) {
//       return res.status(404).json({ error: 'Meeting not found' });
//     }

//     // Extract member IDs from the meeting
//     const memberIds = meeting.members;

//     // Fetch user details for the members
//     const groupMembers = await db.User.findAll({
//       attributes: ['id', 'name', 'email', 'image', 'EntityId'],
//       where: { id: { [Op.in]: memberIds } },
//       raw: true
//     });

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

//     // Prepare the response data
//     const combinedResult = {
//       id: task.id,
//       decision: task.decision,
//       SubTaskCount: count,
//       date: meeting ? meeting.date : null,
//       taskCreateby: "", // Initialize taskCreateby as empty string
//       meetingnumber: meeting ? meeting.meetingnumber : null,
//       priority: task.priority || null, // Use task priority or null if undefined
//       members: task.members,
//       collaborators: "",
//       dueDate: task.dueDate,
//       status: task.status,
//       createdAt: task.createdAt,
//       updatedAt: task.updatedAt,
//       file: task.file || null, // Use task file or null if undefined
//       comments: commentsWithUserInfo || [], // Use comments array or empty array if undefined
//       group: groupMembers // Include group field with all members associated with the task's meeting
//     };

//     // Fetch task creator entity name
//     const taskCreator = task.taskCreateby;
//     if (taskCreator && taskCreator.name === "users") {
//       const userEntity = await db.User.findOne({
//         attributes: ['EntityId'],
//         where: { id: taskCreator.id }
//       });
//       if (userEntity) {
//         const EntID = userEntity.EntityId;
//         const entity = await db.Entity.findOne({
//           attributes: ['name'],
//           where: { id: EntID }
//         });
//         if (task.collaborators) {
//           var colabs = await db.User.findAll({
//             attributes: ['id', 'name', 'image', 'email', 'EntityId'],
//             where: {
//               id: { [Op.in]: task.collaborators }
//             },
//             raw: true
//           });
//         }
//         combinedResult.taskCreateby = entity ? entity.name : "";
//         combinedResult.collaborators = colabs;

//       }
//     } else if (taskCreator && taskCreator.name === "entity") {
//       const entity = await db.Entity.findOne({
//         attributes: ['name'],
//         where: { id: taskCreator.id }
//       });
//       combinedResult.taskCreateby = entity ? entity.name : "";
//       combinedResult.collaborators = task ? task.collaborators : "";

//     } else if (taskCreator && taskCreator.name === "team") {
//       const entity = await db.Team.findOne({
//         attributes: ['name'],
//         where: { id: taskCreator.id }
//       });
//       combinedResult.taskCreateby = entity ? entity.name : "";
//       combinedResult.collaborators = task ? task.collaborators : "";

//     }

//     // Send the response
//     res.status(200).json([combinedResult]); // Wrap result in an array to match the specified format
//   } catch (error) {
//     console.error('Error fetching task details:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// working with entity user and members
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
//       attributes: ['members', 'UserId', 'EntityId'], // Include EntityId in the attributes
//       where: { id: meetingId },
//       raw: true
//     });

//     if (!meeting) {
//       return res.status(404).json({ error: 'Meeting not found' });
//     }

//     // Extract member IDs from the meeting
//     const memberIds = meeting.members;

//     // Fetch user details for the members
//     const groupMembers = await db.User.findAll({
//       attributes: ['id', 'name', 'email', 'image', 'EntityId'],
//       where: { id: { [Op.in]: memberIds } },
//       raw: true
//     });

//     // Fetch additional users based on EntityId from the meeting
//     const additionalUsers = await db.User.findAll({
//       attributes: ['id', 'name', 'email', 'image', 'EntityId'],
//       where: { entityname: meeting.EntityId }, // Fetch users based on EntityId from meeting
//       raw: true
//     });

//     // Add additional users to the groupMembers array if found
//     if (additionalUsers.length > 0) {
//       groupMembers.push(...additionalUsers);
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

//     // Prepare the response data
//     const combinedResult = {
//       id: task.id,
//       decision: task.decision,
//       SubTaskCount: count,
//       date: meeting ? meeting.date : null,
//       taskCreateby: "", // Initialize taskCreateby as empty string
//       meetingnumber: meeting ? meeting.meetingnumber : null,
//       priority: task.priority || null, // Use task priority or null if undefined
//       members: task.members,
//       collaborators: "",
//       dueDate: task.dueDate,
//       status: task.status,
//       createdAt: task.createdAt,
//       updatedAt: task.updatedAt,
//       file: task.file || null, // Use task file or null if undefined
//       comments: commentsWithUserInfo || [], // Use comments array or empty array if undefined
//       group: groupMembers // Include group field with all members associated with the task's meeting, including additional users based on EntityId
//     };

//     // Fetch task creator entity name
//     const taskCreator = task.taskCreateby;
//     if (taskCreator && taskCreator.name === "users") {
//       const userEntity = await db.User.findOne({
//         attributes: ['EntityId'],
//         where: { id: taskCreator.id }
//       });
//       if (userEntity) {
//         const EntID = userEntity.EntityId;
//         const entity = await db.Entity.findOne({
//           attributes: ['name'],
//           where: { id: EntID }
//         });
//         if (task.collaborators) {
//           var colabs = await db.User.findAll({
//             attributes: ['id', 'name', 'image', 'email', 'EntityId'],
//             where: {
//               id: { [Op.in]: task.collaborators }
//             },
//             raw: true
//           });
//         }
//         combinedResult.taskCreateby = entity ? entity.name : "";
//         combinedResult.collaborators = colabs;

//       }
//     } else if (taskCreator && taskCreator.name === "entity") {
//       const entity = await db.Entity.findOne({
//         attributes: ['name'],
//         where: { id: taskCreator.id }
//       });
//       combinedResult.taskCreateby = entity ? entity.name : "";
//       combinedResult.collaborators = task ? task.collaborators : "";

//     } else if (taskCreator && taskCreator.name === "team") {
//       const entity = await db.Team.findOne({
//         attributes: ['name'],
//         where: { id: taskCreator.id }
//       });
//       combinedResult.taskCreateby = entity ? entity.name : "";
//       combinedResult.collaborators = task ? task.collaborators : "";

//     }

//     // Send the response
//     res.status(200).json([combinedResult]); // Wrap result in an array to match the specified format
//   } catch (error) {
//     console.error('Error fetching task details:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };




// working
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
//       attributes: ['members', 'UserId', 'EntityId', 'TeamId'], // Include TeamId in the attributes
//       where: { id: meetingId },
//       raw: true
//     });

//     if (!meeting) {
//       return res.status(404).json({ error: 'Meeting not found' });
//     }

//     // Extract member IDs from the meeting
//     const memberIds = meeting.members;

//     // Fetch user details for the members
//     const groupMembers = await db.User.findAll({
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
//         attributes: ['id','members'],
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

//     // Prepare the response data
//     const combinedResult = {
//       id: task.id,
//       decision: task.decision,
//       SubTaskCount: count,
//       date: meeting ? meeting.date : null,
//       taskCreateby: "", // Initialize taskCreateby as empty string
//       meetingnumber: meeting ? meeting.meetingnumber : null,
//       priority: task.priority || null, // Use task priority or null if undefined
//       members: task.members,
//       collaborators: "",
//       dueDate: task.dueDate,
//       status: task.status,
//       createdAt: task.createdAt,
//       updatedAt: task.updatedAt,
//       file: task.file || null, // Use task file or null if undefined
//       comments: commentsWithUserInfo || [], // Use comments array or empty array if undefined
//       group: groupMembers // Include group field with all members associated with the task's meeting, including additional users based on EntityId and team members
//     };

//     // Fetch task creator entity name
//     const taskCreator = task.taskCreateby;
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
//     } else if (taskCreator && taskCreator.name === "entity") {
//       const entity = await db.Entity.findOne({
//         attributes: ['name'],
//         where: { id: taskCreator.id }
//       });
//       combinedResult.taskCreateby = entity ? entity.name : "";
//       combinedResult.collaborators = task ? task.collaborators : "";

//     } else if (taskCreator && taskCreator.name === "team") {
//       const entity = await db.Team.findOne({
//         attributes: ['name'],
//         where: { id: taskCreator.id }
//       });
//       combinedResult.taskCreateby = entity ? entity.name : "";
//       combinedResult.collaborators = task ? task.collaborators : "";

//     }

//     // Send the response
//     res.status(200).json([combinedResult]); // Wrap result in an array to match the specified format
//   } catch (error) {
//     console.error('Error fetching task details:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };


const GetTaskbyId = async (req, res) => {
  const taskId = req.params.id;
  try {
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
      attributes: ['members','date', 'UserId', 'EntityId', 'TeamId', 'meetingnumber'], // Include TeamId in the attributes
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

    // Fetch task comments for the given task
    const taskComments = await db.SubTaskDoc.findAll({
      where: { TaskId: taskId },
      raw: true
    });

    // Extract unique userIds from comments
    const userIds = [...new Set(taskComments.map(item => parseInt(item.senderId)))];

    // Fetch user details based on userIds
    const users = await db.User.findAll({
      attributes: ['id', 'name', 'image'],
      where: { id: { [Op.in]: userIds } },
      raw: true
    });

    let { count } = await db.SubTask.findAndCountAll({
      where: { TaskId: taskId },
    });

    // Create a map of userIds to corresponding user details for quick lookup
    const userMap = {};
    users.forEach(user => {
      userMap[user.id] = { senderImage: user.image, senderName: user.name };
    });

    // Prepare the comments array with senderName and senderImage
    const commentsWithUserInfo = taskComments.map(comment => ({
      ...comment,
      senderName: userMap[parseInt(comment.senderId)] ? userMap[parseInt(comment.senderId)].senderName : null,
      senderImage: userMap[parseInt(comment.senderId)] ? userMap[parseInt(comment.senderId)].senderImage : null
    }));

    // Fetch user details based on userIds
    // Extract member IDs from the meeting
    const collaborators = task.collaborators;

    // Fetch user details for the members
    let collaboratorsusers = await db.User.findAll({
      attributes: ['id', 'name', 'email', 'image', 'entityname'],
      where: { id: { [Op.in]: collaborators } },
      raw: true
    });

    

    // Prepare the response data
    const combinedResult = {
      id: task.id,
      decision: task.decision,
      SubTaskCount: count,
      date: meeting ? meeting.date : null,
      taskCreateby: "", // Initialize taskCreateby as empty string
      meetingnumber: meeting ? meeting.meetingnumber : null,
      priority: task.priority || null, // Use task priority or null if undefined
      members: task.members,
      collaborators: collaboratorsusers,
      dueDate: task.dueDate,
      status: task.status,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      file: task.file || null, // Use task file or null if undefined
      comments: commentsWithUserInfo || [], // Use comments array or empty array if undefined
      group: groupMembers, // Include group field with all members associated with the task's meeting, including additional users based on EntityId and team members
      // meetingnumber: meeting ? meeting.meetingnumber : null,
    };

    // Fetch task creator entity name
    const taskCreator = task.taskCreateby;
    if (taskCreator && taskCreator.name === "users") {
      const userEntity = await db.User.findOne({
        attributes: ['entityname'],
        where: { id: taskCreator.id }
      });
      if (userEntity) {
        const EntID = userEntity.entityname;
        const entity = await db.Entity.findOne({
          attributes: ['name'],
          where: { id: EntID }
        });
        if (task.collaborators) {
          var colabs = await db.User.findAll({
            attributes: ['id', 'name', 'image', 'email', 'entityname'],
            where: {
              id: { [Op.in]: task.collaborators }
            },
            raw: true
          });
        }
        combinedResult.taskCreateby = entity ? entity.name : "";
        combinedResult.collaborators = colabs;

      }
    } else if (taskCreator && taskCreator.name === "entity") {
      const entity = await db.Entity.findOne({
        attributes: ['name'],
        where: { id: taskCreator.id }
      });
      combinedResult.taskCreateby = entity ? entity.name : "";
      combinedResult.collaborators = task ? task.collaborators : "";

    } else if (taskCreator && taskCreator.name === "team") {
      const entity = await db.Team.findOne({
        attributes: ['name'],
        where: { id: taskCreator.id }
      });
      combinedResult.taskCreateby = entity ? entity.name : "";
      combinedResult.collaborators = task ? task.collaborators : "";

    }

    // Send the response
    res.status(200).json([combinedResult]); // Wrap result in an array to match the specified format
  } catch (error) {
    console.error('Error fetching task details:', error);
    res.status(500).json({ error: 'Internal server error' });
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
          subject: 'Task Created ',
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
              You've been assigned a decision  made during meeting number:
              <span style="font-weight:bold"> ${meetingnumber}</span>. Here are the details:
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
  const { userId} = req.user;
  console.log(userId)


  if (file) {
    const result = await uploadToS3(req.file);
    data = {
      image: `${result.Location}`,
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
  const { userId} = req.user;


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
    let member = await db.Task.findOne({ where: {id: req.params.id} });
      if (!member) {
        return res.status(404).json({ error: "Meeting not found" });
      }

      meetMembers =[]
      let decision = member.dataValues.decision;
      let dueDate = member.dataValues.dueDate;
      
      let PR = member.dataValues.members;
      let meetingId = member.dataValues.meetingId;
      
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
          subject: 'Sub Task Created',
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
              You've been assigned a decision  made during meeting number:
              <span style="font-weight:bold"> ${meetingnumber}</span>. Here are the details:
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

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const meetingId = parseInt(task.meetingId);


    // Fetch the meeting details
    const meeting = await db.Meeting.findOne({
      attributes: ['members','date', 'UserId', 'EntityId', 'TeamId', 'meetingnumber'], // Include TeamId in the attributes
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

// const GetSubList = async (req, res) => {
//   const { search = '', page = 1, pageSize = 5, ...restQueries } = req.query;
//   const filters = {};

//   for (const key in restQueries) {
//     filters[key] = restQueries[key];
//   }
//   const offset = (parseInt(page) - 1) * parseInt(pageSize);
//     var { count, rows } = await db.SubTask.findAndCountAll({
//       where: {
//         TaskId: req.params.id
//       },
//       order: [['createdAt', 'DESC']],
//       raw: true 
//     });


//     const totalEntities = count;
//     const totalPages = Math.ceil(totalEntities / pageSize);
//     res.json({
//       Task: rows,
//       totalPages: parseInt(totalPages),
//       currentPage: parseInt(page),
//       pageSize: parseInt(pageSize),
//       totalTask: parseInt(totalEntities),
//       startTask: parseInt(offset) + 1, // Correct the start entity index
//       endTask: parseInt(offset) + parseInt(pageSize), // Correct the end entity index
//       search
//     });
//   }

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
      attributes: ['members','date', 'UserId', 'EntityId', 'TeamId', 'meetingnumber'], // Include TeamId in the attributes
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
    
const patchTskDoc = async (req, res) =>{
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

// const GetTask = async (req, res) => {
//   const { userId, meetingId, status, entityId } = req.query;

//   try {
//     let whereClause = {};

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
//         attributes: ['id']
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

//     // Update overdue tasks to status 'Over-Due'
//     await Promise.all(tasks.map(async task => {
//       if (task.dueDate && task.dueDate < currentDate && task.status !== "Completed") {
//         await db.Task.update({ stat: "Over-Due" }, {
//           where: { id: task.id }
//         });
//       }
//     }));

//     const meetingIds = tasks.map(task => task.meetingId);
//     const meetings = await db.Meeting.findAll({
//       attributes: ['id', 'date', 'meetingnumber', 'members'], // Include members
//       where: { id: meetingIds },
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
//       attributes: ['id', 'name'],
//       where: {
//         id: { [Op.in]: tasks.map(task => task.userId) }
//       },
//       raw: true
//     });

//     const userMap = userResults.reduce((acc, user) => {
//       acc[user.id] = user;
//       return acc;
//     }, {});

//     // Create a map of meetingId to members
//     const meetingMembersMap = meetings.reduce((acc, meeting) => {
//       acc[meeting.id] = meeting.members;
//       return acc;
//     }, {});

//     // Fetch user details if userId is provided
//     let self = null;
//     if (userId) {
//       self = await db.User.findOne({
//         attributes: ['id', 'image', 'name', 'email', 'EntityId'],
//         where: { id: userId },
//         raw: true,
        
//       });
//     }

//     const combinedResult = tasks.map(task => {
//       const subtaskCount = subTaskCounts[task.id] || 0;
//       const members = meetingMembersMap[task.meetingId] || [];

//       // Add self to the members list if self is not null
//       if (self) {
//         members.push(self);
//       }

//       return {
//         id: task.id,
//         decision: task.decision,
//         meetingId: task.meetingId,
//         priority: task.priority,
//         group: members,
//         dueDate: task.dueDate,
//         members : task.members,
//         status: task.status,
//         stat: task.stat,
//         collaborators: task.collaborators || [],  // assuming task model has a field collaborators
//         taskCreateby: task.taskCreateby,
//         file: task.file,
//         createdAt: task.createdAt,
//         updatedAt: task.updatedAt,
//         subtaskCount: subtaskCount
//       };
//     });

//     // Respond with combined result
//     res.status(200).json(combinedResult);
//   } catch (error) {
//     console.error('Error fetching tasks:', error);
//     res.status(500).json({ error: 'Failed to fetch tasks' });
//   }
// };



// working code
// const GetTask = async (req, res) => {
//   const { userId, meetingId, status, entityId, teamId } = req.query;

//   try {
//     let whereClause = {};

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
//         attributes: ['id']
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

//     // Update overdue tasks to status 'Over-Due'
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

//     // Fetch teams and map them by id
//     const teamIds = [...new Set(meetings.map(meeting => meeting.TeamId))];
//     if (teamId) teamIds.push(teamId);  // Include the teamId from query

//     const teams = await db.Team.findAll({
//       where: { id: { [Op.in]: teamIds } },
//       raw: true
//     });

//     const teamMap = teams.reduce((acc, team) => {
//       acc[team.id] = team;
//       return acc;
//     }, {});

//     // Fetch user details for team members from the teamId in the query
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

//     // Create a map of meetingId to members
//     const meetingMembersMap = meetings.reduce((acc, meeting) => {
//       let members = meeting.members || [];
//       let memberDetails = [];

//       if (meeting.UserId && userMap[meeting.UserId]) {
//         memberDetails.push(userMap[meeting.UserId]); // Add the user from UserId to the members array
//       }
//       if (meeting.EntityId && entityUserMap[meeting.EntityId]) {
//         memberDetails.push(...entityUserMap[meeting.EntityId]); // Add users with the same EntityId to the members array
//       }
//       if (meeting.TeamId && teamMap[meeting.TeamId] && teamMap[meeting.TeamId].members) {
//         let teamMembers = teamMap[meeting.TeamId].members;
//         if (Array.isArray(teamMembers) && teamMembers.length > 0 && typeof teamMembers[0] === 'number') {
//           memberDetails.push(...teamMembers.map(id => userMap[id]).filter(user => user));
//         } else {
//           memberDetails.push(...teamMembers);
//         }
//       }

//       // Add meeting members last
//       if (Array.isArray(members) && members.length > 0 && typeof members[0] === 'number') {
//         memberDetails.push(...members.map(id => userMap[id]).filter(user => user));
//       } else {
//         memberDetails.push(...members); // if members are already in the detailed format
//       }

//       acc[meeting.id] = memberDetails;
//       return acc;
//     }, {});

//     // Fetch user details if userId is provided
//     let self = null;
//     if (userId) {
//       self = await db.User.findOne({
//         attributes: ['id', 'image', 'name', 'email', 'entityname'],
//         where: { id: userId },
//         raw: true,
//       });
//     }

//     const combinedResult = tasks.map(task => {
//       const subtaskCount = subTaskCounts[task.id] || 0;
//       const members = meetingMembersMap[task.meetingId] || [];

//       const uniqueMemberIds = new Set();
//       const uniqueMembers = [];

//       if (self && !uniqueMemberIds.has(self.id)) {
//         uniqueMemberIds.add(self.id);
//         uniqueMembers.push(self);  // Ensure self is added first
//       }

//       members.forEach(member => {
//         if (!uniqueMemberIds.has(member.id)) {
//           uniqueMemberIds.add(member.id);
//           uniqueMembers.push(member);
//         }
//       });

//       return {
//         id: task.id,
//         decision: task.decision,
//         meetingId: task.meetingId,
//         priority: task.priority,
//         group: uniqueMembers,
//         dueDate: task.dueDate,
//         members: task.members,
//         status: task.status,
//         stat: task.stat,
//         collaborators: task.collaborators || [],  // assuming task model has a field collaborators
//         taskCreateby: task.taskCreateby,
//         file: task.file,
//         createdAt: task.createdAt,
//         updatedAt: task.updatedAt,
//         subtaskCount: subtaskCount
//       };
//     });

//     // Respond with combined result
//     res.status(200).json(combinedResult);
//   } catch (error) {
//     console.error('Error fetching tasks:', error);
//     res.status(500).json({ error: 'Failed to fetch tasks' });
//   }
// };


// const GetTask = async (req, res) => {
//   const { userId, meetingId, status, entityId, teamId } = req.query;

//   try {
//     let whereClause = {};

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
//         attributes: ['id']
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

//     // Update overdue tasks to status 'Over-Due'
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

//     // Fetch teams and map them by id
//     const teamIds = [...new Set(meetings.map(meeting => meeting.TeamId))];
//     if (teamId) teamIds.push(teamId);  // Include the teamId from query

//     const teams = await db.Team.findAll({
//       where: { id: { [Op.in]: teamIds } },
//       raw: true
//     });

//     const teamMap = teams.reduce((acc, team) => {
//       acc[team.id] = team;
//       return acc;
//     }, {});

//     // Fetch user details for team members from the teamId in the query
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

//     // Create a map of meetingId to members
//     const meetingMembersMap = meetings.reduce((acc, meeting) => {
//       let members = meeting.members || [];
//       let memberDetails = [];

//       if (meeting.UserId && userMap[meeting.UserId]) {
//         memberDetails.push(userMap[meeting.UserId]); // Add the user from UserId to the members array
//       }
//       if (meeting.EntityId && entityUserMap[meeting.EntityId]) {
//         memberDetails.push(...entityUserMap[meeting.EntityId]); // Add users with the same EntityId to the members array
//       }
//       if (meeting.TeamId && teamMap[meeting.TeamId] && teamMap[meeting.TeamId].members) {
//         let teamMembers = teamMap[meeting.TeamId].members;
//         if (Array.isArray(teamMembers) && teamMembers.length > 0 && typeof teamMembers[0] === 'number') {
//           memberDetails.push(...teamMembers.map(id => userMap[id]).filter(user => user));
//         } else {
//           memberDetails.push(...teamMembers);
//         }
//       }

//       // Add meeting members last
//       if (Array.isArray(members) && members.length > 0 && typeof members[0] === 'number') {
//         memberDetails.push(...members.map(id => userMap[id]).filter(user => user));
//       } else {
//         memberDetails.push(...members); // if members are already in the detailed format
//       }

//       acc[meeting.id] = memberDetails;
//       return acc;
//     }, {});

//     // Fetch user details if userId is provided
//     let self = null;
//     if (userId) {
//       self = await db.User.findOne({
//         attributes: ['id', 'image', 'name', 'email', 'entityname'],
//         where: { id: userId },
//         raw: true,
//       });
//     }

//     const combinedResult = tasks.map(task => {
//       const subtaskCount = subTaskCounts[task.id] || 0;
//       const members = meetingMembersMap[task.meetingId] || [];

//       const uniqueMemberIds = new Set();
//       const uniqueMembers = [];

//       if (self && !uniqueMemberIds.has(self.id)) {
//         uniqueMemberIds.add(self.id);
//         uniqueMembers.push(self);  // Ensure self is added first
//       }

//       members.forEach(member => {
//         if (!uniqueMemberIds.has(member.id)) {
//           uniqueMemberIds.add(member.id);
//           uniqueMembers.push(member);
//         }
//       });

//       return {
//         id: task.id,
//         decision: task.decision,
//         meetingId: task.meetingId,
//         priority: task.priority,
//         group: uniqueMembers,
//         dueDate: task.dueDate,
//         members: task.members,
//         status: task.status,
//         stat: task.stat,
//         collaborators: task.collaborators || [],  // assuming task model has a field collaborators
//         taskCreateby: task.taskCreateby,
//         file: task.file,
//         createdAt: task.createdAt,
//         updatedAt: task.updatedAt,
//         subtaskCount: subtaskCount
//       };
//     });

//     // Respond with combined result
//     res.status(200).json(combinedResult);
//   } catch (error) {
//     console.error('Error fetching tasks:', error);
//     res.status(500).json({ error: 'Failed to fetch tasks' });
//   }
// };


// last working code
// const GetTask = async (req, res) => {
//   const { userId, meetingId, status, entityId, teamId } = req.query;

//   try {
//     let whereClause = {};
    
//      // Use authorized tasks from req.tasks
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
//         // attributes: ['id']
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

//     // Use authorized tasks from req.tasks
   

    
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

//     // Update overdue tasks to status 'Over-Due'
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

//     console.log("Meetings fetched:", meetings); // Debugging line
//     console.log("Tasks fetched:", tasks); // Debugging line

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

//     // Fetch teams and map them by id
//     const teamIds = [...new Set(meetings.map(meeting => meeting.TeamId))];
//     if (teamId) teamIds.push(teamId);  // Include the teamId from query

//     const teams = await db.Team.findAll({
//       where: { id: { [Op.in]: teamIds } },
//       raw: true
//     });

//     const teamMap = teams.reduce((acc, team) => {
//       acc[team.id] = team;
//       return acc;
//     }, {});

//     // Fetch user details for team members from the teamId in the query
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

//     // Create a map of meetingId to members
//     const meetingMembersMap = meetings.reduce((acc, meeting) => {
//       let members = meeting.members || [];
//       let memberDetails = [];

//       if (meeting.UserId && userMap[meeting.UserId]) {
//         memberDetails.push(userMap[meeting.UserId]); // Add the user from UserId to the members array
//       }
//       if (meeting.EntityId && entityUserMap[meeting.EntityId]) {
//         memberDetails.push(...entityUserMap[meeting.EntityId]); // Add users with the same EntityId to the members array
//       }
//       if (meeting.TeamId && teamMap[meeting.TeamId] && teamMap[meeting.TeamId].members) {
//         let teamMembers = teamMap[meeting.TeamId].members;
//         if (Array.isArray(teamMembers) && teamMembers.length > 0 && typeof teamMembers[0] === 'number') {
//           memberDetails.push(...teamMembers.map(id => userMap[id]).filter(user => user));
//         } else {
//           memberDetails.push(...teamMembers);
//         }
//       }

//       // Add meeting members last
//       if (Array.isArray(members) && members.length > 0 && typeof members[0] === 'number') {
//         memberDetails.push(...members.map(id => userMap[id]).filter(user => user));
//       } else {
//         memberDetails.push(...members); // if members are already in the detailed format
//       }

//       acc[meeting.id] = memberDetails;
//       return acc;
//     }, {});

//     // Fetch user details if userId is provided
//     let self = null;
//     if (userId) {
//       self = await db.User.findOne({
//         attributes: ['id', 'image', 'name', 'email', 'entityname'],
//         where: { id: userId },
//         raw: true,
//       });
//     }

//     const combinedResult = tasks.map(task => {
//       const subtaskCount = subTaskCounts[task.id] || 0;
//       const members = meetingMembersMap[task.meetingId] || [];

//       const uniqueMemberIds = new Set();
//       const uniqueMembers = [];

//       if (self && !uniqueMemberIds.has(self.id)) {
//         uniqueMemberIds.add(self.id);
//         uniqueMembers.push(self);  // Ensure self is added first
//       }

//       members.forEach(member => {
//         if (!uniqueMemberIds.has(member.id)) {
//           uniqueMemberIds.add(member.id);
//           uniqueMembers.push(member);
//         }
//       });

//       const meeting = meetings.find(m => String(m.id) === String(task.meetingId)); // Convert to string for comparison
//       const meetingNumber = meeting ? meeting.meetingnumber : null; // Get the meeting number
//       const meetingdate = meeting ? meeting.date : null;

//       // Log for debugging purposes
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
//         meetingNumber: meetingNumber, // Add the meeting number to the response
//         priority: task.priority,
//         group: uniqueMembers,
//         dueDate: task.dueDate,
//         members: task.members,
//         status: task.status,
//         stat: task.stat,
//         collaborators: task.collaborators || [],  // assuming task model has a field collaborators
//         taskCreateby: task.taskCreateby,
//         file: task.file,
//         createdAt: task.createdAt,
//         updatedAt: task.updatedAt,
//         subtaskCount: subtaskCount,
//         createdby: task.createdby
//       };
//     });

//     // Respond with combined result
//     res.status(200).json(combinedResult);
//   } catch (error) {
//     console.error('Error fetching tasks:', error);
//     res.status(500).json({ error: 'Failed to fetch tasks' });
//   }
// };


const GetTask = async (req, res) => {
  const { userId, meetingId, status, entityId, teamId } = req.query;

  try {
    let whereClause = {};

    if (req.tasks) {
      const taskIds = req.tasks.map(task => task.id);
      console.log("Authorized Task IDs:", taskIds);
      whereClause.id = { [Op.in]: taskIds };
    } else {
      console.log("No authorized tasks found in req.tasks");
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

    let tasks = await db.Task.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    const currentDate = new Date().toISOString().slice(0, 10);

    if (status) {
      tasks = tasks.filter(task => {
        if (status === "Over-Due") {
          return task.dueDate && task.dueDate < currentDate && task.status !== "Completed";
        }
        return task.status === status;
      });
    }

    await Promise.all(tasks.map(async task => {
      if (task.dueDate && task.dueDate < currentDate && task.status !== "Completed") {
        await db.Task.update({ stat: "Over-Due" }, {
          where: { id: task.id }
        });
      }
    }));

    const meetingIds = tasks.map(task => task.meetingId);
    const meetings = await db.Meeting.findAll({
      attributes: ['id', 'date', 'meetingnumber', 'members', 'UserId', 'EntityId', 'TeamId'],
      where: { id: { [Op.in]: meetingIds } },
      raw: true
    });

    console.log("Meetings fetched:", meetings); 
    console.log("Tasks fetched:", tasks); 

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

    // Fetch the latest message for each task
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

    const combinedResult = tasks.map(task => {
      const subtaskCount = subTaskCounts[task.id] || 0;
      const members = meetingMembersMap[task.meetingId] || [];

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

      const meeting = meetings.find(m => String(m.id) === String(task.meetingId));
      const meetingNumber = meeting ? meeting.meetingnumber : null;
      const meetingdate = meeting ? meeting.date : null;

      if (!meeting) {
        console.log(`Meeting not found for Task ID: ${task.id}, Meeting ID: ${task.meetingId}`);
      } else if (meetingNumber === null) {
        console.log(`Meeting number is null for Meeting ID: ${meeting.id}`);
      }

      return {
        id: task.id,
        decision: task.decision,
        meetingId: task.meetingId,
        date: meetingdate,
        meetingNumber: meetingNumber,
        priority: task.priority,
        group: uniqueMembers,
        dueDate: task.dueDate,
        members: task.members,
        status: task.status,
        stat: task.stat,
        collaborators: task.collaborators || [],
        taskCreateby: task.taskCreateby,
        file: task.file,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        subtaskCount: subtaskCount,
        createdby: task.createdby,
        updatedbyuser: subTaskMessageMap[task.id] || null
      };
    });

    res.status(200).json(combinedResult);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};







// const  ListTaskCount= async (req, res) => {
//   //count code where bala
// }


const ListTaskCount = async (req, res) => {
  try {
    

    let whereClause = {};
   
    
     // Use authorized tasks from req.tasks
    if (req.tasks || req.tasks.length === 0) {
      const taskIds = req.tasks.map(task => task.id);
      console.log("Authorized Task IDs:", taskIds);
      whereClause.id = { [Op.in]: taskIds };
    } else {
      console.log("No authorized tasks found in req.tasks");
      return res.status(403).json({ error: 'Unauthorized access to tasks' });
    }

    // Define the possible statuses
    const statuses = ["To-Do", "In-Progress", "Over-Due", "Completed"];

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

    

    // Count tasks by status
    for (const status of statuses) {
      const count = await db.Task.count({
        where: { 
          ...whereClause,
          status }
      });

      switch (status) {
        case "To-Do":
          taskCounts.toDoCount = count;
          break;
        case "In-Progress":
          taskCounts.inProgressCount = count;
          break;
        case "Over-Due":
          taskCounts.overdueCount = count;
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

// const ListTaskCount = async (req, res) => {
//   try {
//     if (!req.tasks || req.tasks.length === 0) {
//       console.log("No authorized tasks found in req.tasks");
//       return res.status(403).json({ error: 'Unauthorized access to tasks' });
//     }

//     const taskIds = req.tasks.map(task => task.id);
//     console.log("Authorized Task IDs:", taskIds);

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

//     // Count all tasks and group by status
//     const tasksByStatus = await db.Task.findAll({
//       where: { id: { [Op.in]: taskIds } },
//       attributes: ['status', [db.Sequelize.fn('COUNT', db.Sequelize.col('status')), 'count']],
//       group: ['status']
//     });

//     // Total count of all tasks
//     taskCounts.allTasksCount = taskIds.length;

//     // Set the counts based on the results
//     tasksByStatus.forEach(task => {
//       const status = task.status;
//       const count = task.dataValues.count;

//       switch (status) {
//         case "To-Do":
//           taskCounts.toDoCount = count;
//           break;
//         case "In-Progress":
//           taskCounts.inProgressCount = count;
//           break;
//         case "Over-Due":
//           taskCounts.overdueCount = count;
//           break;
//         case "Completed":
//           taskCounts.completedCount = count;
//           break;
//       }
//     });

//     // Send the response
//     res.json(taskCounts);
//   } catch (error) {
//     console.error('Error fetching task counts:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };


// const ListTaskCount = async (req, res) => {
//   try {
//     // Get statuses from the request body
//     const { statuses } = req.body;

//     if (!Array.isArray(statuses) || statuses.length === 0) {
//       return res.status(400).json({ error: 'Invalid or missing statuses' });
//     }

//     // Initialize an object to hold the counts and tasks
//     const taskCounts = {
//       allTasksCount: 0,
//       toDoCount: 0,
//       inProgressCount: 0,
//       overdueCount: 0,
//       completedCount: 0
//     };

//     const taskDetails = {
//       toDoTasks: [],
//       inProgressTasks: [],
//       overdueTasks: [],
//       completedTasks: []
//     };

//     // Count all tasks
//     taskCounts.allTasksCount = await db.Task.count();

//     // Query tasks by status
//     for (const status of statuses) {
//       const tasks = await db.Task.findAll({
//         where: { status },
//         raw: true
//       });

//       const count = tasks.length;

//       switch (status) {
//         case "To-Do":
//           taskCounts.toDoCount = count;
//           taskDetails.toDoTasks = tasks;
//           break;
//         case "In-Progress":
//           taskCounts.inProgressCount = count;
//           taskDetails.inProgressTasks = tasks;
//           break;
//         case "Over-Due":
//           taskCounts.overdueCount = count;
//           taskDetails.overdueTasks = tasks;
//           break;
//         case "Completed":
//           taskCounts.completedCount = count;
//           taskDetails.completedTasks = tasks;
//           break;
//       }
//     }

//     // Send the response
//     res.json({
//       taskCounts,
//       taskDetails
//     });
//   } catch (error) {
//     console.error('Error fetching task counts:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };



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
  DeleteTskDoc
};



