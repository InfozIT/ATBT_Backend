const express = require('express')
const router = express.Router()
const task = require('../Controllers/task')

router.get('/entity/group/:id',task.ListEntiyGroup)
router.get('/team/group/:id',task.ListTeamGroup)


router.post('/add', task.CreateTask)
router.get('/list', task.ListTask)
router.get('/list/:id', task.GetTask)
router.put('/update/:id',task.UpdateTask)
router.delete('/delete/:id',task.DeleteTask)




module.exports = router;