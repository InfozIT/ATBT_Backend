const express = require('express');
const router = express.Router();
const CreateForm = require('../Controllers/form');

// setting

// Define a route for a specific resource

router.get('/list', CreateForm.GetAllLIST)
router.put('/userform', CreateForm.UserFrom)
router.put('/entityform', CreateForm.EntityFrom)
router.put('/meetingform', CreateForm.MeetingFrom)
router.put('/teamform', CreateForm.TeamFrom)




module.exports = router;