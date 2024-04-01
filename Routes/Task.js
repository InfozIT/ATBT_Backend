const express = require('express')
const router = express.Router()
const task = require('../Controllers/task')



router.get('/entity/group/:id', task.ListEntiyGroup)
router.get('/team/group/:id', task.ListTeamGroup)



module.exports = router;