const express = require('express')
const router = express.Router()
const Team = require('../Controllers/team')
const upload = require('../utils/store');
const hasPermission = require('../middlewares/rolePermission');
const { Permission } = require('../models');


router.post('/add', hasPermission("team", "canCreate"), upload.single('image'),Team.CreateTeam)
router.post('/list', hasPermission("team", "canRead"), Team.ListTeam)
router.get('/list/:id', hasPermission("team", "canRead"), Team.getTeamDataById)
router.put('/update/:id', hasPermission("team", "canUpdate"), Team.UpdateTeam)
router.delete('/delete/:id', hasPermission("team", "canDelete"), Team.DeleteTeamById)



module.exports = router;
