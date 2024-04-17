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

router.post('/entity', authVerify, (req, res) => {

    const { name, description, entityIds, userId,entityNames,userName} = req.body

    // Insert record into user_access table
    userId
    UserAccess.create({userName:userName,entityNames:JSON.stringify(entityNames), user_id: userId, entity_id: JSON.stringify(entityIds), name: name, description: description })

        .then(() => res.status(200).json({ message: 'Access granted to entity-level data' }))

        .catch(err => {

            console.error(err);

            res.status(500).json({ message: 'Internal Server Error' });

        });

});

// Endpoint to grant access to specific selected users' data

router.post('/selected', authVerify, (req, res) => {

    const { name, description,userId ,selectedUsers,selectedUsersNames,userName} = req.body

    // Insert record into user_access table

    UserAccess.create({userName:userName, selectedUsersNames: JSON.stringify(selectedUsersNames), name: name, description: description,user_id: userId, selected_users: JSON.stringify(selectedUsers) })

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


router.put('/update/:id', authVerify, async (req, res) => {
    const AccessId = req.params.id;
    const newData = req.body;
    // Update data in the entitydata table based on the id
    mycon.query('UPDATE UserAccesses SET ? WHERE id = ?', [newData, AccessId], (err, result) => {
      if (err) {
        console.error('Error updating data: ' + err.stack);
        res.status(500).send('Error updating data');
        return;
      }
  
      if (result.affectedRows === 0) {
        res.status(404).send('Entity data not found');
        return;
      }
  
      console.log('Updated ' + result.affectedRows + ' row(s)');
      res.status(200).send('Data updated successfully');
    });
  });


  router.get('/view', authVerify, async (req, res) => {
    const roleId = req.user.roleId;
    if (roleId === 8 || roleId === 9 || roleId === 7) {
        const users = await db.UserAccess.findAll()

        res.status(200).json(users);
    } else {
        res.status(402).json({ message: 'Contact an admin' });
    }
})

  



module.exports = router;
