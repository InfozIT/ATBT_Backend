const express = require('express')
const router = express.Router()
const task = require('../Controllers/task')
const upload = require('../utils/store');
const hasPermission = require('../middlewares/rolePermission');
const authorizeTaskAccess = require('../middlewares/authorizeTaskAccess');

// task 
router.post('/add/:id', hasPermission("task", "canCreate"), upload.single('image'), task.CreateTask)
router.get('/list', authorizeTaskAccess, hasPermission("task", "canRead"),task.GetTask)
router.patch('/update/:id', hasPermission("task", "canUpdate"), upload.single('image'),task.UpdateTask)
router.delete('/delete/:id', hasPermission("task", "canDelete"), task.DeleteTask)
router.get('/listbyid/:id', hasPermission("task", "canRead"),task.GetTaskbyId)
router.get('/taskcount',authorizeTaskAccess, hasPermission("task", "canRead"), task.ListTaskCount)
router.get('/taskList/:id', hasPermission("task", "canRead"),task.GetTaskbyEntity)


// sub task
router.post('/subtaskAdd/:id', hasPermission("task", "canCreate"), upload.single('image'), task.SubTaskAdd)
router.patch('/subtaskUpdate/:id', hasPermission("task", "canUpdate"), upload.single('image'),task.SubTaskUpdate)
router.delete('/subtaskdelete/:id', hasPermission("task", "canDelete"), task.SubTaskDelete)
router.get('/subtaskbyid/:id', hasPermission("task", "canRead"),task.GetSubTaskbyId)
router.get('/subList/:id', hasPermission("task", "canRead"),task.GetSubList)

// for Conmments

router.post('/addComments', hasPermission("task", "canCreate"), upload.single('image'), task.CreateTskDoc)
router.patch('/patchComments/:id', hasPermission("task", "canUpdate"), upload.single('image'),task.patchTskDoc)
router.delete('/delComments/:id', hasPermission("task", "canDelete"), task.DeleteTskDoc)



module.exports = router;