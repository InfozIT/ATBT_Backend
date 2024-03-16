const express = require('express');
const router = express.Router();
const role = require('../Controllers/role')

router.post('/create-role', role.createRoleWithPermissions)
router.put('/update-role/:roleId', role.updateRoleWithPermissions)
router.get('/getroles', role.getAllRoles)
router.post('/public/getroles', role.List_Pub)
router.delete('/deleteRole/:roleId', role.deleteRoleById)
router.get('/getrolebyid/:roleId', role.getRolePermissionsById)

module.exports = router;