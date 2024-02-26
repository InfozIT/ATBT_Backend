const express = require('express')
const router = express.Router()
const User = require('../Controllers/user');
const hasPermission = require('../middlewares/rolePermission');


Define a route for a specific resource
router.post('/create-user', hasPermission("entity", "canCreate"), User.Create_User)
router.get('/list', hasPermission("user", "canRead"), User.List_User)
router.get('/list/:id', hasPermission("user", "canRead"), User.Get_User)
router.put('/update/:id', hasPermission("user", "canUpdate"), User.Update_User)
router.put('/changepassword/:id', hasPermission("user", "canUpdate"), User.Update_Password)
router.put('/forgotpassword', hasPermission("user", "canUpdate"), User.Reset_Password)
router.delete('/delete-user/:id', hasPermission("user", "canDelete"), User.Delete_User)

// Without Roles

// router.post('/create-user', User.Create_User)
// router.get('/list',User.List_User)
// router.get('/list/:id', User.Get_User)
// router.put('/update/:id',User.Update_User)
// router.put('/changepassword/:id', User.Update_Password)
// router.put('/forgotpassword', User.Reset_Password)
// router.delete('/delete-user/:id',User.Delete_User)


module.exports = router;
