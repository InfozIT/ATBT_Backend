const express = require('express')
const router = express.Router()
const Meeting = require('../Controllers/meeting')



router.post('/data', Meeting.createBMeetingData);
router.get('/data/:id', Meeting.getBMeetingDataById);
router.put('/data/:id', Meeting.updateBMeetingDataById);
router.delete('/data/:id', Meeting.deleteBMeetingDataById);
router.get('/', Meeting.BMeetingDataList);

module.exports = router;
