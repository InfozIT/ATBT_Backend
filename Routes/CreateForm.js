const express = require('express');
const router = express.Router();
const CreateForm = require('../Controllers/form');

// setting

// Define a route for a specific resource

router.post('/add', CreateForm.Add_data)
router.get('/list', CreateForm.GetAllLIST)
router.put('/update', CreateForm.Update_data)




module.exports = router;