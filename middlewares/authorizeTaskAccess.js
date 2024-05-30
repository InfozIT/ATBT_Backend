// const { Op } = require('sequelize');
// const db = require('../models/index'); // Adjust the path as needed
// const authVerify = require('./authVerify.middleware')

// const authorizeTaskAccess = async (req, res, next) => {
//   try {
//     const userId = req.user.userId; // Assume user ID is available in req.user (set by previous middleware)
//     const taskId = req.params.id;

//     console.log("userId", userId, "taskId", taskId)
//     // Fetch the task details
//     const task = await db.Task.findOne({
//       where: { id: taskId },
//       include: [
//         { model: db.User, as: 'collaborators', },
//         { model: db.User, as: 'members', },
//         { model: db.User, as: 'createdby', }
//       ]
//     });

//     if (!task) {
//       return res.status(404).json({ error: 'Task not found' });
//     }

//     // Check if the user is authorized
//     const isCollaborator = task.collaborators.some(collaborator => collaborator.id === userId);
//     const isMember = task.members.some(member => member.id === userId);
//     const isCreator = task.createdby.id === userId;

//     if (!isCollaborator && !isMember && !isCreator) {
//       return res.status(403).json({ error: 'Access denied' });
//     }

//     // User is authorized, proceed to the next middleware/route handler
//     next();
//   } catch (error) {
//     console.error('Authorization error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// module.exports = authorizeTaskAccess;

const { Op, literal, where } = require('sequelize');
const db = require('../models/index');
const authVerify = require('./authVerify.middleware');

// const authorizeTaskAccess = async (req, res, next) => {
//     try {
//       const userId = req.user.userId;
  
//       console.log("userId", userId);
  
//       // Fetch all tasks
//       const tasks = await db.Task.findAll();
  
//       // Filter tasks where the user is a collaborator, a member, or the creator
//       const userTasks = tasks.filter(task => {
//         const isCollaborator = task.collaborators && task.collaborators.includes(userId);
//         const isMember = task.members === userId;
//         const isCreator = task.createdby === userId;
  
//         return isCollaborator || isMember || isCreator;
//       });
  
//       if (userTasks.length === 0) {
//         return res.status(404).json({ error: 'No tasks found for the user' });
//       }
  
//       // Store the tasks in the request object for further processing
//       req.tasks = userTasks;
  
//       console.log("tasks", userTasks);
  
//       // User is authorized, proceed to the next middleware/route handler
//       next();
//     } catch (error) {
//       console.error('Authorization error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   };




// meetings 


// const authorizeTaskAccess = async (req, res, next) => {
//     try {
//       const userId = req.user.userId;
  
//       console.log("userId", userId);

//       const loggedInUser = await db.User.findOne({ where: { id: userId } });

        
//         if (loggedInUser && loggedInUser.role === 7) {
//             // If the user is super admin, skip filtering and proceed
//             return next();
//         }
  
//         // for tasks
//     const collaboratorCondition = db.sequelize.where(
//         db.sequelize.fn('JSON_CONTAINS', db.sequelize.col('collaborators'), JSON.stringify(userId)),
//         true
//       );

//       // Fetch tasks where the user is a collaborator, a member, or the creator
//       const tasks = await db.Task.findAll({
//         where: {
//           [Op.or]: [
//             collaboratorCondition,
//             { members: userId },
//             { createdby: userId }
//           ]
//         }
//       });



//     //   fom meetings

//     const allMeetings = await db.Meeting.findAll();

//     // Get unique TeamIds from meetings
//     const teamIds = [...new Set(allMeetings.map(meeting => meeting.TeamId))].filter(id => id);

//     // Fetch teams where TeamId is in teamIds
//     const teams = await db.Team.findAll({
//       where: {
//         id: { [Op.in]: teamIds }
//       }
//     });

//     // Filter teams to get only those where userId is in members
//     const authorizedTeams = teams.filter(team => team.members.includes(userId));

//     // Get authorized TeamIds
//     const authorizedTeamIds = authorizedTeams.map(team => team.id);

//     // Filter meetings based on authorized TeamIds or user-specific criteria
//     const authorizedMeetings = allMeetings.filter(meeting => 
//       authorizedTeamIds.includes(meeting.TeamId) ||
//       meeting.UserId === userId ||
//       meeting.createdBy === userId
//     );

//     req.tasks = tasks;
//     req.meetingmembers = authorizedMeetings;

//     console.log("Authorized Meetings:", authorizedMeetings.map(m => m.id));
  

//       req.tasks = tasks;
//       req.meetingmembers = authorizedMeetings;
  
//     //   console.log("Authorized Meetings:", authorizedMeetings);
  
//       next();
//     } catch (error) {
//       console.error('Authorization error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   };

// const authorizeTaskAccess = async (req, res, next) => {
//     try {
//       const userId = req.user.userId;
  
//       console.log("userId", userId);
  
//       const loggedInUser = await db.User.findOne({ where: { id: userId } });
  
//       if (loggedInUser && loggedInUser.role === 7) {
//         // If the user is super admin, skip filtering and proceed
//         return next();
//       }
  
//       // For tasks
//       const collaboratorCondition = db.sequelize.where(
//         db.sequelize.fn('JSON_CONTAINS', db.sequelize.col('collaborators'), JSON.stringify(userId)),
//         true
//       );
  
//       // Fetch tasks where the user is a collaborator, a member, or the creator
//       const tasks = await db.Task.findAll({
//         where: {
//           [Op.or]: [
//             collaboratorCondition,
//             { members: userId },
//             { createdby: userId }
//           ]
//         }
//       });
  
//       // Fetch all meetings
//       const allMeetings = await db.Meeting.findAll();
  
//       // Get unique TeamIds from meetings
//       const teamIds = [...new Set(allMeetings.map(meeting => meeting.TeamId))].filter(id => id);
  
//       // Fetch teams where TeamId is in teamIds and either user is a member or the creator
//       const teams = await db.Team.findAll({
//         where: {
//           id: { [Op.in]: teamIds },
//           [Op.or]: [
//             db.sequelize.where(
//                 db.sequelize.fn('JSON_CONTAINS', db.sequelize.col('members'), JSON.stringify(userId)),
//                 true
//               ),
//             { createdBy: userId }
//           ]
//         }
//       });
  
//       // Get authorized TeamIds
//       const authorizedTeamIds = teams.map(team => team.id);
  
//       // Filter meetings based on authorized TeamIds or user-specific criteria
//       const authorizedMeetings = allMeetings.filter(meeting =>
//         authorizedTeamIds.includes(meeting.TeamId) ||
//         meeting.UserId === userId ||
//         meeting.createdBy === userId
//       );
  
//       req.tasks = tasks;
//       req.meetingmembers = authorizedMeetings;
  
//       console.log("Authorized Meetings:", authorizedMeetings.map(m => m.id));
  
//       next();
//     } catch (error) {
//       console.error('Authorization error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   };



const authorizeTaskAccess = async (req, res, next) => {
    try {
      const userId = req.user.userId;
  
      console.log("userId", userId);
  
      const loggedInUser = await db.User.findOne({ where: { id: userId } });
  
      if (loggedInUser && loggedInUser.role === 7) {
        // If the user is super admin, skip filtering and proceed
        return next();
      }
  
      // For tasks
      const collaboratorCondition = db.sequelize.where(
        db.sequelize.fn('JSON_CONTAINS', db.sequelize.col('collaborators'), JSON.stringify(userId)),
        true
      );
  
      // Fetch tasks where the user is a collaborator, a member, or the creator
      const tasks = await db.Task.findAll({
        where: {
          [Op.or]: [
            collaboratorCondition,
            { members: userId },
            { createdby: userId }
          ]
        }
      });
  
      // Fetch all meetings
      const allMeetings = await db.Meeting.findAll();
  
      // Get unique TeamIds from meetings
      const teamIds = [...new Set(allMeetings.map(meeting => meeting.TeamId))].filter(id => id);
  
      // Fetch teams where TeamId is in teamIds and either user is a member or the creator
      const teams = await db.Team.findAll({
        where: {
          id: { [Op.in]: teamIds },
          [Op.or]: [
            db.sequelize.where(
                db.sequelize.fn('JSON_CONTAINS', db.sequelize.col('members'), JSON.stringify(userId)),
                true
              ),
            { createdBy: userId }
          ]
        }
      });
  
      // Get authorized TeamIds
      const authorizedTeamIds = teams.map(team => team.id);
  
      // Filter meetings based on authorized TeamIds or user-specific criteria
      const authorizedMeetings = allMeetings.filter(meeting =>
        authorizedTeamIds.includes(meeting.TeamId) ||
        meeting.UserId === userId ||
        meeting.createdBy === userId || 
        meeting.members.includes(userId)
      );
  
      // Fetch EntityIds from meetings
      const entityIds = [...new Set(allMeetings.map(meeting => meeting.EntityId))].filter(id => id);
  
      // Fetch users where entityname matches the EntityId in meetings
      const entityUsers = await db.User.findAll({
        where: {
          entityname: { [Op.in]: entityIds }
        }
      });
  
      // Extract user IDs from entity users
      const entityUserIds = entityUsers.map(user => user.id);
  
      // Filter meetings based on entity user IDs
      const authorizedEntityMeetings = allMeetings.filter(meeting =>
        entityUserIds.includes(meeting.UserId) ||
        entityUserIds.includes(meeting.createdBy)
      );
  
      // Merge authorized meetings
      const finalAuthorizedMeetings = [...new Set([...authorizedMeetings, ...authorizedEntityMeetings])];
  
      req.tasks = tasks;
      req.meetingmembers = finalAuthorizedMeetings;
  
      console.log("Authorized Meetings:", finalAuthorizedMeetings.map(m => m.id));
  
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  

  
  

module.exports = authorizeTaskAccess;
