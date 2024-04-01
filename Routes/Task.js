const express = require('express')
const router = express.Router()
const task = require('../Controllers/task')




router.get('/group/list/:id', task.ListTeam)



module.exports = router;