const express = require('express')
const router = express.Router()
const Team = require('../Controllers/team')



router.post('/data', Team.createTeamData);
router.get('/data/:id', Team.getTeamDataById);
router.put('/data/:id', Team.updateTeamDataById);
router.delete('/data/:id', Team.deleteTeamDataById);
router.get('/', Team.TeamDataList);

module.exports = router;
