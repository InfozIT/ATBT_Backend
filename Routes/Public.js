const express = require('express');
const router = express.Router();

const Entity = require('../Controllers/entite')
const role = require('../Controllers/role')
const Boardmings = require('../Controllers/meeting')
const Team = require('../Controllers/team')
const User = require('../Controllers/user')



router.get('/list/role', role.List_Pub)
router.get('/list/entity', Entity.ListEntityPub)
router.get('/list/boardmings',Boardmings.ListMeetingsPub)
router.get('/list/team', Team.List_Team_Pub)
router.get('/list/user',User.List_User_Pub)


module.exports = router;