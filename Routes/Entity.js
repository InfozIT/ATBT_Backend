const express = require('express');
const router = express.Router();
const ECont = require('../Controllers/entite')
const upload = require('../utils/store');
const hasPermission = require('../middlewares/rolePermission');
const { Permission } = require('../models');



// Define a route for a specific resource

router.post('/add', hasPermission("entity", "canCreate"), upload.single('image'), ECont.CreateAdmin)
router.post('/list', hasPermission("entity", "canRead"), ECont.List_Entite)
router.get('/list/:id', hasPermission("entity", "canRead"), ECont.Get_Entite)
router.put('/update/:id', hasPermission("entity", "canUpdate"), ECont.Update_Entite)
router.delete('/delete/:id', hasPermission("entity", "canDelete"), ECont.Delete_Entite)


//Without Permission


// router.post('/add', ECont.CreateAdmin)
// router.get('/list', ECont.List_Entite)
// router.get('/list/:id', ECont.Get_Entite)
// router.put('/update/:id',ECont.Update_Entite)
// router.delete('/delete/:id',ECont.Delete_Entite)


module.exports = router;
