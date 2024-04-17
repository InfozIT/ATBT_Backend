var db = require('../models/index');
const Sequelize = require('sequelize');

const UserAccess = db.UserAccess;
const mycon = require('../DB/mycon');


const express = require('express');
const authVerify = require('../middlewares/authVerify.middleware');
const { user } = require('../DB/config');
const e = require('express');


const router = express.Router();

// Endpoint to grant access to all system data

router.post('/all', authVerify, (req, res) => {

    const userId = req.user.userId;

    // Insert record into user_access table

    UserAccess.create({ user_id: userId })

        .then(() => res.status(200).json({ message: 'Access granted to all system data' }))

        .catch(err => {

            console.error(err);

            res.status(500).json({ message: 'Internal Server Error' });

        });

});

// Endpoint to grant access to entity-level data

router.post('/entity', authVerify, async(req, res) => {

    const { name, description, entityIds, userId,entityNames,userName} = req.body

    // Check if the email already exists
    const existingUser = await db.UserAccess.findOne({ where: { name } });
    if (existingUser) {
        console.error("name already exists.");
        return res.status(400).send("name already exists");
    }
    UserAccess.create({userName:userName,entityNames:(entityNames), user_id: userId, entity_id: entityIds, name: name, description: description })

        .then(() => res.status(200).json({ message: 'Access granted to entity-level data' }))

        .catch(err => {

            console.error(err);

            res.status(500).json({ message: 'Internal Server Error' });

        });

});

// Endpoint to grant access to specific selected users' data

router.post('/selected', authVerify, async(req, res) => {

    const { name, description,userId ,selectedUsers,selectedUsersNames,userName} = req.body
    const existingUser = await db.UserAccess.findOne({ where: { name } });
    if (existingUser) {
        console.error("name already exists.");
        return res.status(400).send("name already exists");
    }

    UserAccess.create({userName:userName, selectedUsersNames:selectedUsersNames, name: name, description: description,user_id: userId, selected_users:selectedUsers })

        .then(() => res.status(200).json({ message: 'Access granted to selected users\' data' }))

        .catch(err => {

            console.error(err);

            res.status(500).json({ message: 'Internal Server Error' });

        });

});

// Endpoint to revoke access

router.delete('/remove/:accessId', authVerify, (req, res) => {

    const userId = req.user.userId;

    const accessId = req.params.accessId;



    // Delete record from user_access table

    UserAccess.destroy({ where: { id: accessId, user_id: userId } })

        .then(() => res.status(200).json({ message: 'Access revoked' }))

        .catch(err => {

            console.error(err);

            res.status(500).json({ message: 'Internal Server Error' });

        });

});


// router.put('/update/:id', authVerify, async (req, res) => {
//     const AccessId = req.params.id;
//     const newData = req.body;
//     // Update data in the entitydata table based on the id
//     mycon.query('UPDATE UserAccesses SET ? WHERE id = ?', [newData, AccessId], (err, result) => {
//       if (err) {
//         console.error('Error updating data: ' + err.stack);
//         res.status(500).send('Error updating data');
//         return;
//       }
  
//       if (result.affectedRows === 0) {
//         res.status(404).send('Entity data not found');
//         return;
//       }
  
//       console.log('Updated ' + result.affectedRows + ' row(s)');
//       res.status(200).send('Data updated successfully');
//     });
//   });


  router.get('/view', authVerify, async (req, res) => {
    mycon.query('SELECT * FROM UserAccesses', (err, result) => {
      if (err) {
        console.error('Error retrieving data: ' + err.stack);
        res.status(500).send('Error retrieving data');
        return;
      }
      
      // Parsing selectedUsersNames from JSON strings to arrays
      result.forEach(item => {
        if (item.selectedUsersNames || item.entityNames) {
          item.selectedUsersNames = JSON.parse(item.selectedUsersNames);
          item.entityNames = JSON.parse(item.entityNames);

        }
      })
      res.status(200).json(result);
    });
  });
  

  



module.exports = router;
