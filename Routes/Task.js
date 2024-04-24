const express = require('express')
const router = express.Router()
const task = require('../Controllers/task')
const upload = require('../utils/store');
const hasPermission = require('../middlewares/rolePermission');

router.get('/entity/group/:id',task.ListEntiyGroup)
router.get('/team/group/:id',task.ListTeamGroup)




router.post('/add/:id', hasPermission("task", "canCreate"), upload.single('image'), task.CreateTask)
router.post('/list', hasPermission("task", "canRead"), task.ListTask)
router.get('/list/:id', hasPermission("task", "canRead"),task.GetTask)
router.patch('/update/:id', hasPermission("task", "canUpdate"), upload.single('image'),task.UpdateTask)
router.delete('/delete/:id', hasPermission("task", "canDelete"), task.DeleteTask)
router.get('/listbyid/:id', hasPermission("task", "canRead"),task.GetTaskbyId)
router.get('/listAll', hasPermission("meeting", "canRead"), task.GetAllTask)








module.exports = router;