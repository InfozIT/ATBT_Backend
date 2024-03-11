const express = require('express')
const router = express.Router()
const Meeting = require('../Controllers/meeting')
const upload = require('../utils/store');
const hasPermission = require('../middlewares/rolePermission');
const { Permission } = require('../models');



router.post('/add', hasPermission("entity", "canCreate"), upload.single('image'), Meeting.CreateMeeting)
router.post('/list', hasPermission("entity", "canRead"), Meeting.ListMeetings)
router.get('/list/:id', hasPermission("entity", "canRead"), Meeting.GetMeeting)
router.put('/update/:id', hasPermission("entity", "canUpdate"),upload.single('image'), Meeting.UpdateMeetings)
router.delete('/delete/:id', hasPermission("entity", "canDelete"), Meeting.DeleteMeeting)


module.exports = router;
