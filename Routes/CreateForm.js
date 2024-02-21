const express = require('express');
const router = express.Router();
const CreateForm = require('../Controllers/form');

// setting

// Define a route for a specific resource

router.get('/list', CreateForm.GetAllLIST)
router.put('/update', CreateForm.AddUpdate)




module.exports = router;