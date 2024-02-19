const express = require('express');
const router = express.Router();
const Toggle = require('../Controllers/toggle')



// Define a route for a specific resource

router.post('/',Toggle.Add_toggle)



module.exports = router;