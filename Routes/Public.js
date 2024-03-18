const express = require('express');
const router = express.Router();

const Entity = require('../Controllers/entite')
const role = require('../Controllers/role')
const Boardmings = require('../Controllers/meeting')
const Team = require('../Controllers/team')
const User = require('../Controllers/user')



router.post('/list/role', role.List_Pub)
router.post('/list/entity', Entity.ListEntityPub)
router.post('/list/boardmings',Boardmings.ListMeetingsPub)
router.post('/list/team', Team.List_Team_Pub)
router.post('/list/user',User.List_User_Pub)


module.exports = router;