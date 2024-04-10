require('dotenv').config();
var db = require('../models/index');
const Entity = db.Entity;
const Access = db.UserAccess;
const mycon = require('../DB/mycon')


const CreateEntiy = async (req, res) => {
  try {
    let name = req.body.name
    let file = req.file;
    let data = req.body;
    const membersId = [4, 12]  // In future it will come from frontend
    const members = await db.User.findAll({
      where: {
        id: membersId
      }
    });
    console.log(req.body, "body")
    const existingEntity = await db.Entity.findOne({ where: { name } });
    console.log(name, existingEntity, "existin entity")
    if (existingEntity) {
      console.error("entity already exists.");
      return res.status(400).send("entity already exists");
    }
    console.log(data, file, "create data and file")
    if (file) {
      data = {
        image: `${process.env.IMAGE_URI}/images/${req.file.filename}`,
        ...data,
      }
    }
    console.log(data)
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


// const ListEntity = async (req, res) => {
//   const { search = '', page = 1, pageSize = 5, sortBy = 'createdAt', ...restQueries } = req.query;
//   const filters = {};
//   for (const key in restQueries) {
//     filters[key] = restQueries[key];
//   }
//   const offset = (parseInt(page) - 1) * parseInt(pageSize);

//   // MySQL query to fetch paginated entities
//   let sql = `SELECT * FROM Entities WHERE (name LIKE '%${search}%')`;

//   // Add conditions for additional filter fields
//   for (const [field, value] of Object.entries(filters)) {
//     if (value !== '') {
//       sql += ` AND ${field} LIKE '%${value}%'`; // Add the condition
//     }
//   }

//   // Add LIMIT and OFFSET clauses to the SQL query
//   sql += ` ORDER BY ${sortBy} LIMIT ? OFFSET ?`;

//   mycon.query(sql, [parseInt(pageSize), offset], (err, result) => {
//     if (err) {
//       console.error('Error executing MySQL query: ' + err.stack);
//       res.status(500).json({ error: 'Internal server error' });
//       return;
//     }

//     // Execute the count query to get the total number of entities
//     let sqlCount = `SELECT COUNT(*) as total FROM Entities WHERE (name LIKE '%${search}%')`;

//     // Add conditions for additional filter fields
//     for (const [field, value] of Object.entries(filters)) {
//       if (value !== '') {
//         sqlCount += ` AND ${field} LIKE '%${value}%'`;
//       }
//     }

//     mycon.query(sqlCount, (err, countResult) => {
//       if (err) {
//         console.error('Error executing MySQL count query: ' + err.stack);
//         res.status(500).json({ error: 'Internal server error' });
//         return;
//       }

//       const totalEntities = countResult[0].total;
//       const totalPages = Math.ceil(totalEntities / pageSize);

//       res.json({
//         Entities: result,
//         totalPages: parseInt(totalPages),
//         currentPage: parseInt(page),
//         pageSize: parseInt(pageSize),
//         totalEntities: parseInt(totalEntities),
//         startEntity: parseInt(offset) + 1, // Correct the start entity index
//         endEntity: parseInt(offset) + parseInt(pageSize), // Correct the end entity index
//         search
//       });
//     });
//   });
// };

const ListEntity = async (req, res) => {
  const { userId } = req.user;

  const { search = '', page = 1, pageSize = 5, sortBy = 'createdAt', ...restQueries } = req.query;

  const filters = {};

  for (const key in restQueries) {

      filters[key] = restQueries[key];

  }

  const offset = (parseInt(page) - 1) * parseInt(pageSize);

  const accessdata = await db.UserAccess.findOne({ where: { user_id: userId } });
  const Data = await db.User.findOne({ where: { id: userId } });
  let EntityId =Data.EntityId



  console.log(accessdata?.user_id ?? null, accessdata?.entity_id ?? null, "accessdata", accessdata)

  // MySQL query to fetch paginated users

  let sql;

  if (!!accessdata && !accessdata.selected_users && !accessdata.entity_id) {

      sql = `SELECT * FROM Entities WHERE (name LIKE '%${search}%')`

  } else if (!!accessdata && !accessdata.selected_users && accessdata.entity_id) {
      let entityIds = [...JSON.parse(accessdata.entity_id),EntityId]
      console.log(entityIds, typeof (entityIds), "entityIds")

      sql = `SELECT * FROM Entities WHERE (name LIKE '%${search}%') AND id IN (${entityIds.join(',')})`;

  } else if (!accessdata) {

      // sql = `SELECT * FROM Users WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%') AND id IN (${userId})`;
      sql = `SELECT * FROM Entities WHERE (name LIKE '%${search}%') AND id = '${EntityId}'`;


  }

  // let sql = `SELECT * FROM Users WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%' )`;


  // Add conditions for additional filter fields

  for (const [field, value] of Object.entries(filters)) {

      if (value !== '') {

          sql += ` AND ${field} LIKE '%${value}%'`; // Add the condition

      }

  }

  // Add LIMIT and OFFSET clauses to the SQL query

  sql += ` ORDER BY ${sortBy} LIMIT ? OFFSET ?`;

  mycon.query(sql, [parseInt(pageSize), offset], (err, result) => {

      if (err) {

          console.error('Error executing MySQL query: ' + err.stack);

          res.status(500).json({ error: 'Internal server error' });

          return;

      }

      // Execute the count query to get the total number of users

      let sqlCount;

      if (!!accessdata && !accessdata.selected_users && !accessdata.entity_id) {

          sqlCount = `SELECT COUNT(*) as total FROM Entities WHERE (name LIKE '%${search}%')`;

      } else if (!!accessdata && !accessdata.selected_users && accessdata.entity_id) {
          let entityIds = [...JSON.parse(accessdata.entity_id),EntityId]

          sqlCount = `SELECT COUNT(*) as total FROM Entities WHERE (name LIKE '%${search}%') AND id IN (${entityIds.join(',')})`;

      }  else if (!accessdata) {

          // sql = `SELECT * FROM Users WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%') AND id IN (${userId})`;
          sqlCount = `SELECT COUNT(*) as total FROM Users WHERE (name LIKE '%${search}%') AND id = '${EntityId}'`;


      }

      // let sqlCount = `SELECT COUNT(*) as total FROM Users WHERE (name LIKE '%${search}%' OR email LIKE '%${search}%')`;

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
                const totalEntities = countResult[0].total;
                const totalPages = Math.ceil(totalEntities / pageSize);

          res.json({
                    Entities: result,
                    totalPages: parseInt(totalPages),
                    currentPage: parseInt(page),
                    pageSize: parseInt(pageSize),
                    totalEntities: parseInt(totalEntities),
                    startEntity: parseInt(offset) + 1, // Correct the start entity index
                    endEntity: parseInt(offset) + parseInt(pageSize), // Correct the end entity index
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
      image = `${process.env.IMAGE_URI}/images/${req.file.filename}`;
      data = {
        image,
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

module.exports = { CreateEntiy, ListEntity, UpdateEntity, Delete_Entite, Get_Entite, ListEntityPub }