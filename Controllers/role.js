require('dotenv').config();
const db = require('../models/index');

const Role = db.Role;
const Module = db.Module;
const Permission = db.Permission;

// Define your API endpoint
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
      const { module, all, canCreate, canRead, canUpdate, canDelete: del } = permissionData;
      // Find or create the module
      const [newModule, created] = await Module.findOrCreate({
        where: { name: module }
      });
      // Create a new permission
      const newPermission = await Permission.create({
        all,
        canCreate,
        canRead,
        canUpdate,
        canDelete: del
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
    const rolePermissions = {
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

    res.status(200).json({ role: rolePermissions });
  } catch (error) {
    console.error('Error getting role permissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const updateRoleWithPermissions = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { role, description, permissions } = req.body;

    // Find the role to update
    const existingRole = await Role.findOne({
      where: { id: roleId },
      include: [{
        model: Permission,
        include: [{
          model: Module,
          attributes: ['name']
        }],
        attributes: ['id', 'all', 'canCreate', 'canRead', 'canUpdate', 'canDelete']
      }]
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
      const { module, all, canCreate, canRead, canUpdate, canDelete: del } = permissionData;

      // Find existing permission if it exists
      const existingPermission = existingRole.Permissions.find(permission => permission.Modules[0].name === module);
      if (existingPermission) {
        // Update existing permission
        existingPermission.all = all;
        existingPermission.canCreate = canCreate;
        existingPermission.canRead = canRead;
        existingPermission.canUpdate = canUpdate;
        existingPermission.canDelete = del;
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

module.exports = { createRoleWithPermissions, updateRoleWithPermissions, getAllRoles, deleteRoleById, getRolePermissionsById };
