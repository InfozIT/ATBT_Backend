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

const { Op, literal } = require('sequelize');
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

const authorizeTaskAccess = async (req, res, next) => {
    try {
      const userId = req.user.userId;
  
      console.log("userId", userId);

      const loggedInUser = await db.User.findOne({ where: { id: userId } });

        
        if (loggedInUser && loggedInUser.role === 7) {
            // If the user is super admin, skip filtering and proceed
            return next();
        }
  
      // Constructing the condition for collaborators using JSON_CONTAINS
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
  
      if (tasks.length === 0) {
        return res.status(404).json({ error: 'No tasks found for the user' });
      }
  
      req.tasks = tasks;
  
    //   console.log("tasks", tasks);
  
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  
  

module.exports = authorizeTaskAccess;
