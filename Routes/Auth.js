const express = require('express')
const { generateToken } = require('../utils/utils');
const { Login_User } = require("../Controllers/user")
const authRouter = express.Router()
// const Role = require("../models/Role");
const { Role, Module, Permission } = require('../models/index');


authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const userDetails = await Login_User(email, password);
        const roleId = userDetails.RoleId
        console.log("roleid", roleId)
        const role = await Role.findOne({
            where: { id: roleId },
            include: [{
                model: Permission, include: [{
                    model: Module,
                    // where: { name: moduleName }
                }]
            }]
        });
        console.log("role", role.Permissions[0])

        const token = generateToken(userDetails.id, userDetails.RoleId);
        res.json({ role: role, user: userDetails, token, success: true, message: "Login successful" });
    } catch (error) {
        res.status(401).json({ error: `Invalid credentials ${error}` });
    }
})


module.exports = authRouter;