const express = require('express');
const router = express.Router();

const Entity = require('../Controllers/entite')
const role = require('../Controllers/role')
const Team = require('../Controllers/team')
const User = require('../Controllers/user')
const Task = require('../Controllers/task')



router.post('/list/role', role.List_Pub)
router.post('/list/entity', Entity.ListEntityPub)
router.post('/list/team', Team.List_Team_Pub)
router.post('/list/user', User.List_User_Pub)
router.post('/list/task', Task.List_Task_Pub)


module.exports = router;