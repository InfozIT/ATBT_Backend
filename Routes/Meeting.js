const express = require('express')
const router = express.Router()
const Meeting = require('../Controllers/meeting')
const upload = require('../utils/store');
const hasPermission = require('../middlewares/rolePermission');
const authorizeTaskAccess = require('../middlewares/authorizeTaskAccess');

// list group

// router.get('/groupEntity/:id',Meeting.ListEntiyGroup)
// router.get('/groupTeam/:id',Meeting.ListTeamGroup)
// router.get('/groupUser/:id',Meeting.ListUserGroup)


router.post('/add', hasPermission("entity", "canCreate"), upload.single('image'), Meeting.CreateMeeting)
router.post('/list',authorizeTaskAccess, hasPermission("meeting", "canRead"), Meeting.GetMeetingList)
router.get('/getByid/:id', hasPermission("meeting", "canRead"), Meeting.GetById)
router.patch('/update/:id', hasPermission("meeting", "canUpdate"),upload.single('image'), Meeting.PatchMeetings)

router.get('/list', authorizeTaskAccess, hasPermission("meeting", "canRead"), Meeting.GetMeeting)
router.put('/update/:id', hasPermission("meeting", "canUpdate"),upload.single('image'), Meeting.UpdateMeetings)
router.delete('/delete/:id', hasPermission("meeting", "canDelete"), Meeting.DeleteMeeting)

router.get('/getAttachment', hasPermission("meeting", "canRead"), Meeting.getAttachments)
router.delete('/deleteAttachment/:id', hasPermission("meeting", "canDelete"), Meeting.delAttachmentId)





module.exports = router;
