const express = require('express')
const router = express.Router()
const User = require('../Controllers/user');
const hasPermission = require('../middlewares/rolePermission');
const upload = require('../utils/store');

router.post('/create-user', hasPermission("user", "canCreate"), upload.single('image'), User.Create_User)
router.get('/list', hasPermission("user", "canRead"), User.List_User)
router.get('/list/:id', hasPermission("user", "canRead"), User.Get_User)
router.put('/update/:id', hasPermission("user", "canUpdate"), upload.single('image'), User.Update_User)
router.delete('/delete-user/:id', hasPermission("user", "canDelete"), User.Delete_User)

module.exports = router;
