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


// working code

const authorizeTaskAccess = async (req, res, next) => {
    try {
      const userId = req.user.userId;
  
      console.log("userId", userId);
  
      const loggedInUser = await db.User.findOne({ where: { id: userId } });
  
    //   if (loggedInUser && loggedInUser.role === 7) {
    //     // If the user is super admin, skip filtering and proceed
    //     return next();
    //   }

    if (loggedInUser && loggedInUser.RoleId === 7) {
        // If the user is super admin, fetch all tasks and meetings without filtering
        const allTasks = await db.Task.findAll();
        const allMeetings = await db.Meeting.findAll();
  
        req.tasks = allTasks;
        req.meetingmembers = allMeetings;
  
        console.log("Super admin access granted to all tasks and meetings.");
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

    //   // For sub tasks
    //   const stcollaboratorCondition = db.sequelize.where(
    //     db.sequelize.fn('JSON_CONTAINS', db.sequelize.col('collaborators'), JSON.stringify(userId)),
    //     true
    //   );
  
    //   // Fetch tasks where the user is a collaborator, a member, or the creator
    //   const subtasks = await db.Task.findAll({
    //     where: {
    //       [Op.or]: [
    //         stcollaboratorCondition,
    //         { members: userId },
    //         { createdby: userId }
    //       ]
    //     }
    //   });
  
    // task auth ended

    // meeting auth start
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
    // meeting auth ended


    // // teams authorized start
    // // Define the condition for team access
    // const collaboratorConditionforteams = db.sequelize.where(
    //   db.sequelize.fn('JSON_CONTAINS', db.sequelize.col('members'), JSON.stringify(userId)),
    //   true
    // );

    // // Fetch teams where the user is a member or the creator
    // const teams = await db.Team.findAll({
    //   where: {
    //     [Op.or]: [
    //       collaboratorConditionforteams,
    //       { createdBy: userId }
    //     ]
    //   }
    // });

    // // If no teams are found, deny access
    // if (teams.length === 0) {
    //   return res.status(403).json({ error: 'Access denied' });
    // }

    // // Pass the authorized teams to the request object
    //   req.authorizedTeams = teams.map(team => team.id);

      req.tasks = tasks;
    //   req.subtasks = subtasks;
      req.meetingmembers = finalAuthorizedMeetings;

  
      // console.log("Authorized Meetings:", finalAuthorizedMeetings.map(m => m.id));
  
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  

module.exports = authorizeTaskAccess;
