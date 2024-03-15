const express = require('express')
const router = express.Router()
const User = require('../Controllers/user');
const Entity = require('../Controllers/entite');
const Team = require('../Controllers/team');
const Meet = require('../Controllers/meeting');


// router.post('/create-user', upload.single('image'), User.Create_User)

router.post('/user',User.ListUserPub)
router.post('/entity',Entity.ListEntityPub)
router.post('/team',Team.ListTeamPub)
router.post('/boardmeeting',Meet.ListMeetPub)



module.exports = router;