
const { Role, Module, Permission } = require('../models/index'); // Assuming your models are exported from a file named 'models'

const hasPermission = (moduleName, permissionName) => {
    return async (req, res, next) => {
        try {
            const { userId, roleId } = req.user;
            // console.log(roleId, "rId")
            if (!roleId) {
                return res.status(403).json({ message: 'Role not found' });
            }
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

            // const check = role.Permissions.find(permission => {
            //     permission.Modules.nmae = 
            // })
            let permissionFound = false;
            // if (role && role.Permissions[0].Modules) {
            //     for (const permission of role.Permissions[0].Modules) {
            //         if (permission[permissionName] === permissionName) {
            //             permissionFound = true;
            //             break;
            //         }
            //     }
            // }

            role.Permissions.find(permission => {
                console.log("permission", permission.canCreate, permission.canRead, permission.canUpdate, permission.canDelete, permission.Modules[0].name)
                if (permission[permissionName] === true) {
                    console.log("passed crud", permission.Modules[0].name, "moduleName: ", moduleName)
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



            // const module = role.Modules.find(module => module.name === moduleName);
            // if (!module) {
            //     return res.status(403).json({ message: 'Module not found for this role' });
            // }
            // console.log("module", module)
            // const permission = await module.getPermissions({ where: { name: permissionName } });
            // if (!permission || permission.length === 0) {
            //     return res.status(403).json({ message: 'Permission not found for this module' });
            // }
            // console.log("permission", permission)
            // If user has permission, call next()
            // If not, send 403 Forbidden response

        } catch (error) {
            console.error('Error in hasPermission middleware:', error);

            return res.status(500).json({ message: 'Internal server error' });

        }

    };

};



module.exports = hasPermission;
