require('dotenv').config();
var db = require('../models/index');
const Entity = db.Entity;
const mycon = require('../DB/mycon')
const uploadToS3 = require('../utils/wearhouse')
// const { Op } = require('sequelize');
const { Op } = require('sequelize'); 


const CreateEntiy = async (req, res) => {
  try {
    let name = req.body.name
    let file = req.file;
    let data = req.body;
    console.log()
    const membersId = [4, 12]  // In future it will come from frontend
    const members = await db.User.findAll({
      where: {
        id: membersId
      }
    });
    const existingEntity = await db.Entity.findOne({ where: { name } });
    if (existingEntity) {
      return res.status(400).send("entity already exists");
    }
    if (file) {

      const result = await uploadToS3(req.file);
      data = {
        image: `${result.Location}`,
        ...data,
      }
    }
    mycon.query('INSERT INTO Entities SET ?', data, async (err, result) => {
      if (err) {
        console.error('Error inserting data: ' + err.stack);
        return res.status(500).send('Error inserting data');
      }
      const createdEntity = await db.Entity.findOne({ where: { id: result.insertId } });
      if (createdEntity && members) {
        await createdEntity.addUsers(members);
      }
      res.status(201).send(`${result.insertId}`);

    });
  } catch (error) {
    console.error("Error creating Entity:", error);
    res.status(500).send("Error creating user");
  }
};

const ListEntityPub = async (req, res) => {
  const { search = '', page = 1, pageSize = 5, sortBy = 'createdAt', ...restQueries } = req.query;
  const filters = {};
  for (const key in restQueries) {
    filters[key] = restQueries[key];

  }
  const offset = (parseInt(page) - 1) * (parseInt(pageSize));

  // MySQL query to fetch paginated users

  let sql = `SELECT * FROM Entities WHERE (name LIKE '%${search}%')`;

  // Add conditions for additional filter fields

  for (const [field, value] of Object.entries(filters)) {

    if (value !== '') {

      sql += ` AND ${field} LIKE '%${value}%'`; // Add the condition

    }

  }
  mycon.query(sql, [offset, pageSize], (err, result) => {

    if (err) {

      console.error('Error executing MySQL query: ' + err.stack);

      res.status(500).json({ error: 'Internal server error' });

      return;
    }

    // Execute the count query to get the total number of users

    let sqlCount = `SELECT COUNT(*) as total FROM Entities WHERE (name LIKE '%${search}%')`;

    // Add conditions for additional filter fields

    for (const [field, value] of Object.entries(filters)) {

      if (value !== '') {

        sqlCount += ` AND ${field} LIKE '%${value}%'`;

      }
    }
    mycon.query(sqlCount, async (err, countResult) => {

      if (err) {

        console.error('Error executing MySQL count query: ' + err.stack);

        res.status(500).json({ error: 'Internal server error' });

        return;

      }

      const totalUsers = countResult[0].total;

      const totalPages = Math.ceil(totalUsers / pageSize);

      const accessdata  = await db.UserAccess.findOne({ where: { user_id : 22} });
      console.log(accessdata,"accessdata")

      const final = result.map(item => { return { name: item.name, id: item.id, image: item.image } });

      res.json({

        Entites: final,

        totalPages: parseInt(totalPages),

        currentPage: parseInt(page),

        pageSize: parseInt(pageSize),

        totalEntities: parseInt(totalUsers),

        startEntity: parseInt(offset),

        endEntity: parseInt(offset + pageSize),

        search

      });

    });

  });

};


const Get_Entite = (req, res) => {
  const entityId = req.params.id;
  mycon.query('SELECT * FROM Entities WHERE id = ?', entityId, (err, result) => {
    if (err) {
      console.error('Error retrieving data: ' + err.stack);
      res.status(500).send('Error retrieving data');
      return;
    }

    if (result.length === 0) {
      res.status(404).send('Entity data not found');
      return;
    }

    res.status(200).json(result[0]);
  });
};

const UpdateEntity = async (req, res) => {
  try {
    const { id } = req.params;
    let data = req.body;
    let file = req.file;
    let image;
    console.log(data, file, "update data and file")
    if (file) {
      const result = await uploadToS3(req.file);
      data = {
        image: `${result.Location}`,
        ...data
      }
    }

    // Define the SQL query to update the user
    const updateQuery = `UPDATE Entities SET ? WHERE id = ?`;

    // Execute the update query
    mycon.query(updateQuery, [data, id], (error, updateResults) => {
      if (error) {
        console.error("Error updating User:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.status(201).send(`${id}`);
    });
  } catch (error) {
    console.error("Error updating User:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



// const ListEntity = async (req, res) => {
//   const { userId } = req.user;

//   const { search = '', page = 1, pageSize = 5, sortBy = 'id DESC', ...restQueries } = req.query;

//   const filters = {};

//   for (const key in restQueries) {
//       filters[key] = restQueries[key];
//   }

//   const offset = (parseInt(page) - 1) * parseInt(pageSize);

//   const accessdata = await db.UserAccess.findOne({ where: { user_id: userId } });
//   const Data = await db.User.findOne({ where: { id: userId } });
//   let EntityId = Data.EntityId

//   // console.log(accessdata?.user_id ?? null, accessdata?.entity_id ?? null, accessdata?.selected_users ?? null, "accessdata", accessdata)

//   // MySQL query to fetch paginated entities
//   let sql;

//   if (!!accessdata && !accessdata.selected_users && !accessdata.entity_id) {
//     // console.log("hello _ 1")
//       sql = `SELECT * FROM Entities WHERE (name LIKE '%${search}%')`
//   } else if (!!accessdata && !accessdata.selected_users && accessdata.entity_id) {
//     // console.log("hello _ 2")
//       let entityIds = [...JSON.parse(accessdata.entity_id), EntityId]
//       console.log(entityIds, typeof (entityIds), "entityIds")
//       sql = `SELECT * FROM Entities WHERE (name LIKE '%${search}%') AND id IN (${entityIds.join(',')})`;
//     } 
//     else if (!!accessdata && accessdata.selected_users && !accessdata.entity_id) {
//       // console.log("hello _ 3", accessdata.selected_users)
//       //get array of user entity ids
//       // userEntityIds = [56]
//       const users = await db.User.findAll({
//         attributes: ['EntityId'], // Only fetch the entityId column
//         where: {
//           id: [...JSON.parse(accessdata.selected_users)] // Filter users based on userIds array
//         },
//         raw: true // Get raw data instead of Sequelize model instances
//       });
//       const entityIds = users.map(user => user.EntityId);
//       // console.log(entityIds,"ndcnwocbowbcowboubwou beowubobwobwow")
//       sql = `SELECT * FROM Entities WHERE (name LIKE '%${search}%') AND id IN (${entityIds.join(',')})`;
//       // sql = `SELECT * FROM Entities WHERE (name LIKE '%${search}%')`
//   } 
//   else if (!accessdata) {
//     // console.log("hello _ 4")
//       sql = `SELECT * FROM Entities WHERE (name LIKE '%${search}%') AND id = '${EntityId}'`;
//   }

//   // Add conditions for additional filter fields
//   for (const [field, value] of Object.entries(filters)) {
//       if (value !== '') {
//           sql += ` AND ${field} LIKE '%${value}%'`; // Add the condition
//       }
//   }

//   // Add LIMIT and OFFSET clauses to the SQL query
//   sql += ` ORDER BY ${sortBy} LIMIT ? OFFSET ?`;

//   mycon.query(sql, [parseInt(pageSize), offset], (err, result) => {
//       if (err) {
//           console.error('Error executing MySQL query: ' + err.stack);
//           res.status(500).json({ error: 'Internal server error' });
//           return;
//       }

//       // Execute the count query to get the total number of entities
//       let sqlCount;
//       if (!!accessdata && !accessdata.selected_users && !accessdata.entity_id) {
//         // console.log("first _ 1")
//           sqlCount = `SELECT COUNT(*) as total FROM Entities WHERE (name LIKE '%${search}%')`;
//       } else if (!!accessdata && !accessdata.selected_users && accessdata.entity_id) {
//         // console.log("first _ 2")
//           let entityIds = [...JSON.parse(accessdata.entity_id), EntityId]
//           // console.log(entityIds, "entityIds")
//           sqlCount = `SELECT COUNT(*) as total FROM Entities WHERE (name LIKE '%${search}%') AND id IN (${entityIds.join(',')})`;
//       } 
//       else if (!!accessdata && accessdata.selected_users && !accessdata.entity_id) {
//         // console.log("first _ 3")
//         //get array of user entity ids
//         userEntityIds = [81]
//         sqlCount = `SELECT COUNT(*) as total FROM Entities WHERE (name LIKE '%${search}%') AND id IN (${userEntityIds.join(',')})`;
//         // sqlCount = `SELECT COUNT(*) as total FROM Entities WHERE (name LIKE '%${search}%')`
//     }
//        else if (!accessdata) {
//         // console.log("first _ 4")
//           sqlCount = `SELECT COUNT(*) as total FROM Users WHERE (name LIKE '%${search}%') AND id = '${EntityId}'`;
//       }

//       // Add conditions for additional filter fields
//       for (const [field, value] of Object.entries(filters)) {
//           if (value !== '') {
//               sqlCount += ` AND ${field} LIKE '%${value}%'`;
//           }
//       }

//       mycon.query(sqlCount, async (err, countResult) => {
//           if (err) {
//               console.error('Error executing MySQL count query: ' + err.stack);
//               res.status(500).json({ error: 'Internal server error' });
//               return;
//           }

//           const totalEntities = countResult[0].total;
//           const totalPages = Math.ceil(totalEntities / pageSize);

//           res.json({
//               Entities: result,
//               totalPages: parseInt(totalPages),
//               currentPage: parseInt(page),
//               pageSize: parseInt(pageSize),
//               totalEntities: parseInt(totalEntities),
//               startEntity: parseInt(offset) + 1, // Correct the start entity index
//               endEntity: parseInt(offset) + parseInt(pageSize), // Correct the end entity index
//               search
//           });
//       });
//   });
// };


// sequilize

// const ListEntity = async (req, res) => {
//   const { userId } = req.user;
//   const { search = '', page = 1, pageSize = 5, sortBy = 'id DESC', ...restQueries } = req.query;

//   const filters = {};
//   for (const key in restQueries) {
//     filters[key] = restQueries[key];
//   }

//   const offset = (parseInt(page) - 1) * parseInt(pageSize);

//   try {
//     const accessdata = await db.UserAccess.findOne({ where: { user_id: userId } });
//     const user = await db.User.findOne({ where: { id: userId } });
//     const EntityId = user.EntityId;

//     let whereClause = {
//       name: { [Op.like]: `%${search}%` },
//     };

//     if (accessdata) {
//       if (!accessdata.selected_users && !accessdata.entity_id) {
//         // No additional filters
//       } else if (!accessdata.selected_users && accessdata.entity_id) {
//         const entityIds = [...JSON.parse(accessdata.entity_id), EntityId];
//         whereClause.id = { [Op.in]: entityIds };
//       } else if (accessdata.selected_users && !accessdata.entity_id) {
//         const users = await db.User.findAll({
//           attributes: ['EntityId'],
//           where: { id: { [Op.in]: JSON.parse(accessdata.selected_users) } },
//           raw: true,
//         });
//         const entityIds = users.map(user => user.EntityId);
//         whereClause.id = { [Op.in]: entityIds };
//       }
//     } else {
//       whereClause.id = EntityId;
//     }

//     // Add additional filters
//     for (const [field, value] of Object.entries(filters)) {
//       if (value !== '') {
//         whereClause[field] = { [Op.like]: `%${value}%` };
//       }
//     }

//     const entities = await db.Entity.findAndCountAll({
//       where: whereClause,
//       order: [[sortBy.split(' ')[0], sortBy.split(' ')[1]]],
//       limit: parseInt(pageSize),
//       offset,
//     });

//     const totalEntities = entities.count;
//     const totalPages = Math.ceil(totalEntities / pageSize);

//     res.json({
//       Entities: entities.rows,
//       totalPages,
//       currentPage: parseInt(page),
//       pageSize: parseInt(pageSize),
//       totalEntities,
//       startEntity: offset + 1,
//       endEntity: offset + parseInt(pageSize),
//       search,
//     });
//   } catch (err) {
//     console.error('Error executing Sequelize query: ' + err.stack);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };


const ListEntity = async (req, res) => {
  const { userId } = req.user;
  const { search = '', page = 1, pageSize = 5, sortBy = 'id DESC', ...restQueries } = req.query;

  const filters = {};
  for (const key in restQueries) {
    filters[key] = restQueries[key];
  }

  const offset = (parseInt(page) - 1) * parseInt(pageSize);

  try {
    const accessdata = await db.UserAccess.findOne({ where: { user_id: userId } });
    const user = await db.User.findOne({ where: { id: userId } });
    const EntityId = user.EntityId;

    let whereClause = {
      name: { [Op.like]: `%${search}%` },
    };

    if (accessdata) {
      if (!accessdata.selected_users && !accessdata.entity_id) {
        // No additional filters
      } else if (!accessdata.selected_users && accessdata.entity_id) {
        const entityIds = [...JSON.parse(accessdata.entity_id), EntityId];
        whereClause.id = { [Op.in]: entityIds };
      } else if (accessdata.selected_users && !accessdata.entity_id) {
        const users = await db.User.findAll({
          attributes: ['EntityId'],
          where: { id: { [Op.in]: JSON.parse(accessdata.selected_users) } },
          raw: true,
        });
        const entityIds = users.map(user => user.EntityId);
        whereClause.id = { [Op.in]: entityIds };
      }
    } else {
      whereClause.id = EntityId;
    }

    // Add additional filters
    for (const [field, value] of Object.entries(filters)) {
      if (value !== '') {
        whereClause[field] = { [Op.like]: `%${value}%` };
      }
    }

    const entities = await db.Entity.findAndCountAll({
      where: whereClause,
      order: [[sortBy.split(' ')[0], sortBy.split(' ')[1]]],
      limit: parseInt(pageSize),
      offset,
    });

    // Function to get task counts for an entity
    const getTaskCounts = async (entityId) => {
      const users = await db.User.findAll({
        attributes: ['id'],
        where: { entityname: entityId },
        raw: true,
      });

      console.log("users", users)

      const userIds = users.map(user => user.id);

      console.log("userIds", userIds)

      if (userIds.length === 0) {
        return {
          totalTaskCount: 0,
          overDueCount: 0,
          completedCount: 0,
          inProgressCount: 0,
          toDoCount: 0,
        };
      }

      const collaboratorCondition = db.sequelize.where(
        db.sequelize.fn('JSON_CONTAINS', db.sequelize.col('collaborators'), JSON.stringify(userIds)),
        true
      );

      // const totalTaskCount = await db.Task.count({
      //   where: {
      //     [Op.or]: [
      //       { createdby: userIds},
      //       { members: userIds },
      //       collaboratorCondition
      //     ]
      //   }
      // });

      

      const overDueCount = await db.Task.count({
        where: {
          [Op.or]: [
            collaboratorCondition,
            { members: userIds },
            { createdby: userIds }
            
          ],
          dueDate: { [Op.lt]: new Date() },
          status: { [Op.ne]: 'Completed' }
        }
      });

      const completedCount = await db.Task.count({
        where: {
          [Op.or]: [
            collaboratorCondition,
            { members: userIds },
            { createdby: userIds }
            
          ],
          status: 'Completed'
        }
      });

      const inProgressCount = await db.Task.count({
        where: {
          [Op.or]: [
            collaboratorCondition,
            { members: userIds },
            { createdby: userIds }
            
          ],
          status: 'In-Progress'
        }
      });

      const toDoCount = await db.Task.count({
        where: {
          [Op.or]: [
            collaboratorCondition,
            { members: userIds },
            { createdby: userIds }
            
          ],
          status: 'To-Do'
        }
      });

      const totalTaskCount = overDueCount + completedCount + inProgressCount + toDoCount

      return {
        totalTaskCount,
        overDueCount,
        completedCount,
        inProgressCount,
        toDoCount,
      };
    };

    // Add task counts to each entity
    const entitiesWithTaskCounts = await Promise.all(entities.rows.map(async (entity) => {
      const taskCounts = await getTaskCounts(entity.id);
      return {
        ...entity.dataValues,
        taskCounts,
      };
    }));

    const totalEntities = entities.count;
    const totalPages = Math.ceil(totalEntities / pageSize);

    res.json({
      Entities: entitiesWithTaskCounts,
      totalPages,
      currentPage: parseInt(page),
      pageSize: parseInt(pageSize),
      totalEntities,
      startEntity: offset + 1,
      endEntity: offset + parseInt(pageSize),
      search,
    });
  } catch (err) {
    console.error('Error executing Sequelize query: ' + err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
};















// const ListEntity = async (req, res) => {
//   const { userId } = req.user;
//   const { search = '', page = 1, pageSize = 5, sortBy = 'id DESC', ...restQueries } = req.query;

//   const filters = {};
//   for (const key in restQueries) {
//     filters[key] = restQueries[key];
//   }

//   const offset = (parseInt(page) - 1) * parseInt(pageSize);

//   const accessdata = await db.UserAccess.findOne({ where: { user_id: userId } });
//   const Data = await db.User.findOne({ where: { id: userId } });
//   const EntityId = Data.EntityId;

//   let sql;
//   if (!!accessdata && !accessdata.selected_users && !accessdata.entity_id) {
//     sql = `SELECT * FROM Entities WHERE (name LIKE '%${search}%')`;
//   } else if (!!accessdata && !accessdata.selected_users && accessdata.entity_id) {
//     const entityIds = [...JSON.parse(accessdata.entity_id), EntityId];
//     sql = `SELECT * FROM Entities WHERE (name LIKE '%${search}%') AND id IN (${entityIds.join(',')})`;
//   } else if (!!accessdata && accessdata.selected_users && !accessdata.entity_id) {
//     const users = await db.User.findAll({
//       attributes: ['EntityId'],
//       where: {
//         id: [...JSON.parse(accessdata.selected_users)],
//       },
//       raw: true,
//     });
//     const entityIds = users.map(user => user.EntityId);
//     sql = `SELECT * FROM Entities WHERE (name LIKE '%${search}%') AND id IN (${entityIds.join(',')})`;
//   } else if (!accessdata) {
//     sql = `SELECT * FROM Entities WHERE (name LIKE '%${search}%') AND id = '${EntityId}'`;
//   }

//   for (const [field, value] of Object.entries(filters)) {
//     if (value !== '') {
//       sql += ` AND ${field} LIKE '%${value}%'`;
//     }
//   }

//   sql += ` ORDER BY ${sortBy} LIMIT ? OFFSET ?`;

//   mycon.query(sql, [parseInt(pageSize), offset], async (err, result) => {
//     if (err) {
//       console.error('Error executing MySQL query: ' + err.stack);
//       res.status(500).json({ error: 'Internal server error' });
//       return;
//     }

//     const entities = result;

//     for (let entity of entities) {
//       const entityId = entity.id;

//       const collaboratorCondition = db.sequelize.where(
//         db.sequelize.fn('JSON_CONTAINS', db.sequelize.col('members'), JSON.stringify(userId)),
//         true
//       );
//       const meetings = await db.Meeting.findAll({
//         where: {
//           [Op.or]: [
//             { UserId: userId },
//             collaboratorCondition,
//           ],
//           entityId: entityId,
//         },
//       });

//       for (let meeting of meetings) {
//         const [totalTaskCount, overDueCount, completedCount, inProgressCount, toDoCount] = await Promise.all([
//           db.Task.count({ where: { meetingId: meeting.id } }),
//           db.Task.count({ where: { meetingId: meeting.id, status: 'Over-Due' } }),
//           db.Task.count({ where: { meetingId: meeting.id, status: 'Completed' } }),
//           db.Task.count({ where: { meetingId: meeting.id, status: 'In-Progress' } }),
//           db.Task.count({ where: { meetingId: meeting.id, status: 'To-Do' } }),
//         ]);

//         meeting.setDataValue('taskCounts', {
//           totalTaskCount,
//           overDueCount,
//           completedCount,
//           inProgressCount,
//           toDoCount,
//         });
//       }

//       entity.meetings = taskcount;
//     }

//     let sqlCount;
//     if (!!accessdata && !accessdata.selected_users && !accessdata.entity_id) {
//       sqlCount = `SELECT COUNT(*) as total FROM Entities WHERE (name LIKE '%${search}%')`;
//     } else if (!!accessdata && !accessdata.selected_users && accessdata.entity_id) {
//       const entityIds = [...JSON.parse(accessdata.entity_id), EntityId];
//       sqlCount = `SELECT COUNT(*) as total FROM Entities WHERE (name LIKE '%${search}%') AND id IN (${entityIds.join(',')})`;
//     } else if (!!accessdata && accessdata.selected_users && !accessdata.entity_id) {
//       const userEntityIds = [81];
//       sqlCount = `SELECT COUNT(*) as total FROM Entities WHERE (name LIKE '%${search}%') AND id IN (${userEntityIds.join(',')})`;
//     } else if (!accessdata) {
//       sqlCount = `SELECT COUNT(*) as total FROM Users WHERE (name LIKE '%${search}%') AND id = '${EntityId}'`;
//     }

//     for (const [field, value] of Object.entries(filters)) {
//       if (value !== '') {
//         sqlCount += ` AND ${field} LIKE '%${value}%'`;
//       }
//     }

//     mycon.query(sqlCount, async (err, countResult) => {
//       if (err) {
//         console.error('Error executing MySQL count query: ' + err.stack);
//         res.status(500).json({ error: 'Internal server error' });
//         return;
//       }

//       const totalEntities = countResult[0].total;
//       const totalPages = Math.ceil(totalEntities / pageSize);

//       res.json({
//         Entities: entities,
//         totalPages: parseInt(totalPages),
//         currentPage: parseInt(page),
//         pageSize: parseInt(pageSize),
//         totalEntities: parseInt(totalEntities),
//         startEntity: parseInt(offset) + 1,
//         endEntity: parseInt(offset) + parseInt(pageSize),
//         search,
//       });
//     });
//   });
// };







// const ListEntity = async (req, res) => {
//   const { userId } = req.user;
//   const { search = '', page = 1, pageSize = 5, sortBy = 'id DESC', ...restQueries } = req.query;

//   const filters = {};
//   for (const key in restQueries) {
//     filters[key] = restQueries[key];
//   }

//   const offset = (parseInt(page) - 1) * parseInt(pageSize);

//   try {
//     const accessdata = await db.UserAccess.findOne({ where: { user_id: userId } });
//     const userData = await db.User.findOne({ where: { id: userId } });
//     const userEntityId = userData.EntityId;

//     let sql = `SELECT * FROM Entities WHERE (name LIKE ?)`;
//     let countSql = `SELECT COUNT(*) as total FROM Entities WHERE (name LIKE ?)`;
//     const replacements = [`%${search}%`];

//     // Handle access data and adjust queries accordingly
//     if (accessdata) {
//       if (accessdata.selected_users) {
//         const selectedUsers = JSON.parse(accessdata.selected_users);
//         const users = await db.User.findAll({
//           attributes: ['EntityId'],
//           where: { id: selectedUsers },
//           raw: true
//         });
//         const entityIds = users.map(user => user.EntityId).concat(userEntityId);
//         sql += ` AND id IN (${entityIds.join(',')})`;
//         countSql += ` AND id IN (${entityIds.join(',')})`;
//       } else if (accessdata.entity_id) {
//         const entityIds = JSON.parse(accessdata.entity_id).concat(userEntityId);
//         sql += ` AND id IN (${entityIds.join(',')})`;
//         countSql += ` AND id IN (${entityIds.join(',')})`;
//       } else {
//         sql += ` AND id = ${userEntityId}`;
//         countSql += ` AND id = ${userEntityId}`;
//       }
//     } else {
//       sql += ` AND id = ${userEntityId}`;
//       countSql += ` AND id = ${userEntityId}`;
//     }

//     // Add conditions for additional filter fields
//     for (const [field, value] of Object.entries(filters)) {
//       if (value !== '') {
//         sql += ` AND ${field} LIKE ?`;
//         countSql += ` AND ${field} LIKE ?`;
//         replacements.push(`%${value}%`);
//       }
//     }

//     // Add ORDER BY, LIMIT, and OFFSET
//     sql += ` ORDER BY ${sortBy} LIMIT ? OFFSET ?`;
//     replacements.push(parseInt(pageSize), offset);

//     // Execute the paginated query
//     mycon.query(sql, replacements, (err, result) => {
//       if (err) {
//         console.error('Error executing MySQL query: ' + err.stack);
//         return res.status(500).json({ error: 'Internal server error' });
//       }

//       // Execute the count query
//       mycon.query(countSql, replacements.slice(0, -2), (err, countResult) => {
//         if (err) {
//           console.error('Error executing MySQL count query: ' + err.stack);
//           return res.status(500).json({ error: 'Internal server error' });
//         }

//         const totalEntities = countResult[0].total;
//         const totalPages = Math.ceil(totalEntities / pageSize);

//         res.json({
//           Entities: result,
//           totalPages: parseInt(totalPages),
//           currentPage: parseInt(page),
//           pageSize: parseInt(pageSize),
//           totalEntities: parseInt(totalEntities),
//           startEntity: parseInt(offset) + 1,
//           endEntity: Math.min(parseInt(offset) + parseInt(pageSize), totalEntities),
//           search
//         });
//       });
//     });
//   } catch (err) {
//     console.error('Error in ListEntity function: ' + err.stack);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };









const Delete_Entite = async (req, res) => {
  try {
    await Entity.destroy({
      where: { id: req.params.id },
      // truncate: true
    });

    res.status(200).json({ message: `deleted successfully ${req.params.id}` });
  } catch (error) {
    console.error("Error deleting:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const ListEntityUsers = (req, res) => {
  const entityId = req.params.id;
  mycon.query('SELECT * FROM Users WHERE entityname = ?', entityId, (err, result) => {
    if (err) {
      console.error('Error retrieving data: ' + err.stack);
      res.status(500).send('Error retrieving data');
      return;
    }

    if (result.length === 0) {
      res.status(200).json([]);
      return;
    }

    res.status(200).json(result);
  });
};

module.exports = { CreateEntiy, ListEntity, UpdateEntity, Delete_Entite, Get_Entite, ListEntityPub,ListEntityUsers }