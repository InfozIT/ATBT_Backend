const express = require('express')
const router = express.Router()
const User = require('../Controllers/user');
const hasPermission = require('../middlewares/rolePermission');

// Define a route for the homepage
router.get('/', (req, res) => {
    res.send('Welcome to the homepage!');
});

// Define a route for a specific resource
router.post('/create-user', User.Create_User)
router.post('/create', User.createUserData);
router.get('/list', hasPermission("user", "read"), User.List_User)
router.get('/list/:id', hasPermission("user", "read"), User.Get_User)
router.put('/update/:id', hasPermission("user", "update"), User.Update_User)
router.put('/changepassword/:id', hasPermission("user", "update"), User.Update_Password)
router.put('/forgotpassword', hasPermission("user", "update"), User.Reset_Password)
router.delete('/delete-user/:id', hasPermission("user", "delete"), User.Delete_User)


module.exports = router;
