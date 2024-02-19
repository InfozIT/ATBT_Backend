const express = require('express');
const router = express.Router();
const ECont = require('../Controllers/entite')
const upload = require('../utils/store');
const hasPermission = require('../middlewares/rolePermission');



// Define a route for a specific resource

router.post('/add', hasPermission("entity", "create"), upload.single('image'), ECont.Add_Entite)
router.get('/list', hasPermission("entity", "read"), ECont.List_Entite)
router.get('/list/:id', hasPermission("entity", "read"), ECont.Get_Entite)
router.put('/update/:id', hasPermission("entity", "update"), ECont.Update_Entite)
router.delete('/delete/:id', hasPermission("entity", "delete"), ECont.Delete_Entite)


module.exports = router;