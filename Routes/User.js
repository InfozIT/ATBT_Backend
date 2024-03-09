const express = require('express')
const router = express.Router()
const User = require('../Controllers/user');
const hasPermission = require('../middlewares/rolePermission');
const upload = require('../utils/store');

// router.post('/create-user', upload.single('image'), User.Create_User)
router.post('/create-user', upload.single('image'), hasPermission("user", "canCreate"), User.Create_User)
router.post('/list', hasPermission("user", "canRead"), User.List_User)
router.get('/list/:id', hasPermission("user", "canRead"), User.Get_User)
router.put('/update/:id', upload.single('image'), hasPermission("user", "canUpdate"), User.Update_User)
router.delete('/delete-user/:id', hasPermission("user", "canDelete"), User.Delete_User)

module.exports = router;
