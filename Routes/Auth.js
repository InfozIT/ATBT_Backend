const express = require('express')
const User = require('../Controllers/user');
const authVerify = require('../middlewares/authVerify.middleware');
const router = express.Router()
// const Role = require("../models/Role");


router.post('/login', User.Login_User);

router.put('/changepassword/:id', User.Update_Password)
router.put('/forgotpassword', User.Reset_Password)
router.put('/renewpassword/:id', authVerify, User.RenewPassword)


module.exports = router;