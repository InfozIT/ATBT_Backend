
const { Role, Module, Permission } = require('../models/index'); // Assuming your models are exported from a file named 'models'

const hasPermission = (moduleName, permissionName) => {
    return async (req, res, next) => {
        try {
            const { userId, roleId } = req.user;
            if (!roleId) {
                return res.status(403).json({ message: 'Role not found' });
            }
            const role = await Role.findOne({
                where: { id: roleId },
                include: [{
                    model: Permission, include: [{
                        model: Module,
                    }]
                }]
            });

            let permissionFound = false;

            role.Permissions.find(permission => {
                if (permission[permissionName] === true) {
                    if (permission.Modules[0].name === moduleName) {
                        permissionFound = true;
                        return true;
                    } else {
                        console.log("module not accessible");
                    }
                } else {
                    console.log("permission not there");
                }
            });

            console.log(permissionFound, "pf found")

            if (!permissionFound) {
                return res.status(403).json({ message: 'Permission or Module not found for this role' });
            }

            // If permission is found, proceed to next middleware
            next();


        } catch (error) {
            console.error('Error in hasPermission middleware:', error);

            return res.status(500).json({ message: 'Internal server error' });

        }

    };

};



module.exports = hasPermission;
