require('dotenv').config();
const db = require('../models/index');

// Import necessary models
const Role = db.Role;
const Module = db.Module;
const Permission = db.Permission;

// // Define your API endpoint
// const createRoleWithPermissions = async (req, res) => {
//     try {
//         const { role, description, permissions } = req.body;

//         // check if role already existing role
//         // const existingRole = await Role.findOne({where: {name: role}});
//         // if(existingRole){
//         //     return res.status(400).json({error: "Role already exists"})
//         // }
//         // Create the role
//         const newRole = await Role.create({
//             name: role,
//             description: description
//         });
//         // Loop through each permission and assign it to the respective module
//         for (const perm of permissions) {
//             const { module, all, create, read, update, delete: del } = perm;
//             // Find or create the module
//             let moduleInstance = await Module.findOne({ where: { name: module } });
//             if (!moduleInstance) {
//                 moduleInstance = await Module.create({ name: module });
//             }
//             // Find or create the permission
//             let permissionInstance = await Permission.findOne({ where: { name: module } });
//             if (!permissionInstance) {
//                 permissionInstance = await Permission.create({ name: module });
//             }
//             // Associate permission with module
//             await moduleInstance.addPermission(permissionInstance, {
//                 through: {
//                     all: !!all, // Convert to boolean
//                     create: !!create, // Convert to boolean
//                     read: !!read, // Convert to boolean
//                     update: !!update, // Convert to boolean
//                     delete: !!del // Convert to boolean
//                 }
//             });
//             // Associate the module with the role
//             await newRole.addModule(moduleInstance);
//         }
//         res.status(201).json({ message: 'Role created successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };


const getAllRoles = async (req, res) => {
  try {
    // Fetch all roles
    const roles = await Role.findAll();

    // If no roles found, return empty array
    if (!roles || roles.length === 0) {
      return res.status(404).json({ message: 'No roles found' });
    }

    // Return roles
    res.status(200).json({ roles });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getRolePermissionsById = async (req, res) => {
  try {
    const { roleId } = req.params;

    // Check if the role exists
    const role = await Role.findByPk(roleId, {
      include: 'Permissions' // Assuming 'Permissions' is the name of the association
    });

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Extract permissions from the role
    const permissions = role.Permissions.map(permission => ({
      id: permission.id,
      name: permission.name, // Assuming 'name' is a field of the permission
      // Add more fields if needed
    }));

    res.status(200).json({ permissions });
  } catch (error) {
    console.error('Error getting role permissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



const deleteRoleById = async (req, res) => {
  try {
    const { roleId } = req.params;

    // Check if the role exists
    const role = await Role.findByPk(roleId);

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Find all permissions associated with the role
    const permissions = await role.getPermissions();

    // Delete all permissions associated with the role
    await role.removePermissions(permissions);

    // Delete permissions themselves
    await Promise.all(permissions.map(permission => permission.destroy()));

    // Finally, delete the role
    await role.destroy();

    res.status(200).json({ message: 'Role and associated permissions deleted successfully' });
  } catch (error) {
    console.error('Error deleting role and associated permissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




const createRoleWithPermissions = async (req, res) => {
  try {
    const { role, description, permissions } = req.body;
    // Create the role entry
    const newRole = await Role.create({
      name: role,
      description: description
    });
    // Iterate through permissions and associate modules with permissions
    for (const permissionData of permissions) {
      const { module, all, create, read, update, delete: del } = permissionData;
      // Find or create the module
      const [newModule, created] = await Module.findOrCreate({
        where: { name: module }
      });
      // Create a new permission
      const newPermission = await Permission.create({
        all,
        create,
        read,
        update,
        delete: del
      });

      // Associate the permission with the module
      await newPermission.addModule(newModule);
      // Associate the permission with the role
      await newRole.addPermission(newPermission);
    }
    res.status(201).json({ message: 'Role created successfully' });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }

};



// update

const updateRoleWithPermissions = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { role, description, permissions } = req.body;

    // Find the role to update
    const existingRole = await Role.findByPk(roleId, {
      include: [Permission] // Include permissions to update existing ones
    });

    if (!existingRole) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Update role details
    existingRole.name = role;
    existingRole.description = description;
    await existingRole.save();

    // Iterate through permissions
    for (const permissionData of permissions) {
      const { module, all, create, read, update, delete: del } = permissionData;

      // Find existing permission if it exists
      const existingPermission = existingRole.Permissions.find(permission => permission.Module.name === module);

      if (existingPermission) {
        // Update existing permission
        existingPermission.all = all;
        existingPermission.create = create;
        existingPermission.read = read;
        existingPermission.update = update;
        existingPermission.delete = del;
        await existingPermission.save();
      } else {
        console.error(`Permission for module ${module} not found for role ${roleId}`);
      }
    }

    res.status(200).json({ message: 'Role updated successfully' });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// const updateRoleWithPermissions = async (req, res) => {
//   try {
//     const { roleId } = req.params; // Assuming roleId is passed as a parameter
//     const { role, description, permissions } = req.body;
//     console.log("roleIdd", roleId);
//     // Find the role to update
//     const existingRole = await Role.findByPk(roleId);
//     if (!existingRole) {
//       return res.status(404).json({ error: 'Role not found' });
//     }

//     // Update role details
//     existingRole.name = role;
//     existingRole.description = description;
//     await existingRole.save();

//     // Clear existing permissions for the role
//     await existingRole.removePermissions(existingRole.permissions);

//     // Iterate through permissions and associate modules with permissions
//     for (const permissionData of permissions) {
//       const { module, all, create, read, update, delete: del } = permissionData;
//       // Find or create the module
//       const [newModule, created] = await Module.findOrCreate({
//         where: { name: module }
//       });
//       // Create a new permission
//       const newPermission = await Permission.create({
//         all,
//         create,
//         read,
//         update,
//         delete: del
//       });

//       // Associate the permission with the module
//       await newPermission.addModule(newModule);
//       // Associate the permission with the role
//       await existingRole.addPermission(newPermission);
//     }

//     res.status(200).json({ message: 'Role updated successfully' });
//   } catch (error) {
//     console.error('Error updating role:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

module.exports = { createRoleWithPermissions, updateRoleWithPermissions, getAllRoles, deleteRoleById, getRolePermissionsById };



// module.exports = { createRoleWithPermissions }

// require('dotenv').config();
// var db = require('../models/index');

// // Import necessary models
// const Role = db.Role
// const Module = db.Module
// const Permission = db.Permission

// // Define your API endpoint

// const createRoleWithPermissions = async (req, res) => {
//     try {
//         const { role, description, permissions } = req.body;
//         // Create the role
//         const newRole = await Role.create({
//             name: role,
//             description: description
//         });
//         // Loop through each permission and assign it to the respective module
//         for (const perm of permissions) {
//             const { module, all, create, read, update, delete: del } = perm;
//             // Find or create the module
//             const [moduleInstance, created] = await Module.findOrCreate({
//                 where: { name: module }
//             });
//             // Add permissions to the module
//             await moduleInstance.addPermission(moduleInstance, {
//                 through: {
//                     all: all,
//                     create: create,
//                     read: read,
//                     update: update,
//                     delete: del
//                 }
//             });
//             // Associate the module with the role
//             await newRole.addModule(moduleInstance);
//         }
//         res.status(201).json({ message: 'Role created successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };