const express = require('express');
const router = express.Router();
const ECont = require('../Controllers/entite')
const upload = require('../utils/store');
const hasPermission = require('../middlewares/rolePermission');




// Define a route for a specific resource

router.post('/add', hasPermission("entity", "canCreate"), upload.single('image'), ECont.CreateEntiy)
router.post('/list', hasPermission("entity", "canRead"), ECont.ListEntity)
router.post('/User/list/:id', hasPermission("entity", "canRead"), ECont.ListEntityUsers)
router.get('/list/:id', hasPermission("entity", "canRead"), ECont.Get_Entite)
router.put('/update/:id', hasPermission("entity", "canUpdate"), upload.single('image'), ECont.UpdateEntity)
router.delete('/delete/:id', hasPermission("entity", "canDelete"), ECont.Delete_Entite)


//Without Permission


// router.post('/add', ECont.CreateAdmin)
// router.get('/list', ECont.List_Entite)
// router.get('/list/:id', ECont.Get_Entite)
// router.put('/update/:id',ECont.Update_Entite)
// router.delete('/delete/:id',ECont.Delete_Entite)


module.exports = router;
