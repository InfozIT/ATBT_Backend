const express = require('express');
const router = express.Router();
const Form = require('../Controllers/form')


router.post('/entity', Form.EntityForm)
router.post('/user', Form.UserForm)
router.post('/board', Form.BoardForm)
router.post('/teams', Form.TeamsForm)



module.exports = router;