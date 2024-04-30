const express = require('express')
const router = express.Router()
const Meeting = require('../Controllers/meeting')
const upload = require('../utils/store');
const hasPermission = require('../middlewares/rolePermission');

// list group

router.get('/groupMember/:id',Meeting.ListEntiyGroup)
router.get('/team/group/:id',Meeting.ListTeamGroup)


router.post('/add', hasPermission("entity", "canCreate"), upload.single('image'), Meeting.CreateMeeting)
router.post('/list', hasPermission("meeting", "canRead"), Meeting.ListMeetings)
router.get('/list', hasPermission("meeting", "canRead"), Meeting.GetMeeting)
router.put('/update/:id', hasPermission("meeting", "canUpdate"),upload.single('image'), Meeting.UpdateMeetings)
router.delete('/delete/:id', hasPermission("meeting", "canDelete"), Meeting.DeleteMeeting)


module.exports = router;
