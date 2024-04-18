const express = require('express')
const router = express.Router()
const task = require('../Controllers/task')
const upload = require('../utils/store');
const hasPermission = require('../middlewares/rolePermission');

router.get('/entity/group/:id',task.ListEntiyGroup)
router.get('/team/group/:id',task.ListTeamGroup)


// router.post('/add/:id', task.CreateTask)
// router.get('/list', task.ListTask)
// router.get('/list/:id', task.GetTask)
// router.put('/update/:id',task.UpdateTask)
// router.delete('/delete/:id',task.DeleteTask)


router.post('/add/:id', hasPermission("task", "canCreate"), upload.single('image'), task.CreateTask)
router.post('/list', hasPermission("task", "canRead"), task.ListTask)
router.get('/list/:id', hasPermission("task", "canRead"),task.GetTask)
router.patch('/update/:id', hasPermission("task", "canUpdate"), upload.single('image'),task.UpdateTask)
router.delete('/delete/:id', hasPermission("task", "canDelete"), task.DeleteTask)




module.exports = router;