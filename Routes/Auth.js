const express = require('express')
const { generateToken } = require('../utils/utils');
const { Login_User } = require("../Controllers/user")
const authRouter = express.Router()
// const Role = require("../models/Role");
const { Role, Module, Permission } = require('../models/index');


authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required." });
        }

        const userDetails = await Login_User(email, password);

        if (!userDetails) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        const roleId = userDetails.RoleId;

        const role = await Role.findOne({
            where: { id: roleId },
            include: [{
                model: Permission,
                include: [{
                    model: Module,
                    attributes: ['name']
                }],
                attributes: ['all', 'canCreate', 'canRead', 'canUpdate', 'canDelete']
            }]
        });

        if (!role) {
            return res.status(404).json({ error: "Role not found." });
        }

        const simplifiedRole = {
            id: role.id,
            name: role.name,
            description: role.description,
            Permissions: role.Permissions.map(permission => ({
                module: permission.Modules.length ?
                    permission.Modules[0].name
                    : null,
                all: permission.all,
                canCreate: permission.canCreate,
                canRead: permission.canRead,
                canUpdate: permission.canUpdate,
                canDelete: permission.canDelete,
            }))
        };

        const token = generateToken(userDetails.id, userDetails.RoleId);
        res.json({ role: simplifiedRole, user: userDetails, token, success: true, message: "Login successful" });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "An unexpected error occurred." });
    }
});


module.exports = authRouter;