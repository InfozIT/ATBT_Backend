const express = require('express')
const User = require('../Controllers/user');
const router = express.Router()
// const Role = require("../models/Role");


router.post('/login', User.Login_User);

router.put('/changepassword/:id', User.Update_Password)
router.put('/forgotpassword', User.Reset_Password)


module.exports = router;