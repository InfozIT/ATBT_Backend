require('dotenv').config();
const db = require('../models/index');
const mycon = require('../DB/mycon')
const Role = db.Role;
const Module = db.Module;
const Permission = db.Permission;

// Define your API endpoint
const createRoleWithPermissions = async (req, res) => {
  try {
    const { role, description, permissions } = req.body;
    // Create the role entry
    console.log(req.body, "body")
    const existingUser = await db.Role.findOne({ where: { name: role } });
    if (existingUser) {
      console.error("name already exists.");
      return res.status(400).send("name already exists");
    }
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
  const { search = '', page = 1, pageSize = 5, sortBy = 'createdAt', ...restQueries } = req.query;
  const filters = {};
  for (const key in restQueries) {
      filters[key] = restQueries[key];

  }
  const offset = (parseInt(page) - 1) * (parseInt(pageSize));

  // MySQL query to fetch paginated users

  let sql = `SELECT * FROM Roles WHERE (name LIKE '%${search}%')`;

  // Add conditions for additional filter fields

  for (const [field, value] of Object.entries(filters)) {

      if (value !== '') {

          sql += ` AND ${field} LIKE '%${value}%'`; // Add the condition

      }

  }
  mycon.query(sql, [offset, pageSize], (err, result) => {

      if (err) {

          console.error('Error executing MySQL query: ' + err.stack);

          res.status(500).json({ error: 'Internal server error' });

          return;
      }

      // Execute the count query to get the total number of users

      let sqlCount = `SELECT COUNT(*) as total FROM Roles WHERE (name LIKE '%${search}%')`;

      // Add conditions for additional filter fields

      for (const [field, value] of Object.entries(filters)) {

          if (value !== '') {

              sqlCount += ` AND ${field} LIKE '%${value}%'`;

          }

      }

      mycon.query(sqlCount, (err, countResult) => {

          if (err) {

              console.error('Error executing MySQL count query: ' + err.stack);

              res.status(500).json({ error: 'Internal server error' });

              return;

          }

          const totalUsers = countResult[0].total;

          const totalPages = Math.ceil(totalUsers / pageSize);

          res.json({

            roles: result,

              totalPages: totalPages,

              currentPage: page,

              pageSize: pageSize,

              totalRoles: totalUsers,

              startRoles: offset,

              endRoles: offset + pageSize,

              search

          });

      });

  });

};

const List_Pub = async (req, res) => {
  const { search = '', page = 1, pageSize = 5, sortBy = 'createdAt', ...restQueries } = req.query;
  const filters = {};
  for (const key in restQueries) {
      filters[key] = restQueries[key];

  }
  const offset = (parseInt(page) - 1) * (parseInt(pageSize));

  // MySQL query to fetch paginated users

  let sql = `SELECT * FROM Roles WHERE (name LIKE '%${search}%')`;

  // Add conditions for additional filter fields

  for (const [field, value] of Object.entries(filters)) {

      if (value !== '') {

          sql += ` AND ${field} LIKE '%${value}%'`; // Add the condition

      }

  }
  mycon.query(sql, [offset, pageSize], (err, result) => {

      if (err) {

          console.error('Error executing MySQL query: ' + err.stack);

          res.status(500).json({ error: 'Internal server error' });

          return;
      }

      // Execute the count query to get the total number of users

      let sqlCount = `SELECT COUNT(*) as total FROM Roles WHERE (name LIKE '%${search}%')`;

      // Add conditions for additional filter fields

      for (const [field, value] of Object.entries(filters)) {

          if (value !== '') {

              sqlCount += ` AND ${field} LIKE '%${value}%'`;

          }

      }

      mycon.query(sqlCount, (err, countResult) => {

          if (err) {

              console.error('Error executing MySQL count query: ' + err.stack);

              res.status(500).json({ error: 'Internal server error' });

              return;

          }

          const totalUsers = countResult[0].total;

          const totalPages = Math.ceil(totalUsers / pageSize);

          const final = result.map(item => { return {name: item.name,id: item.id} });
          res.json({

            roles: final,

              totalPages: totalPages,

              currentPage: page,

              pageSize: pageSize,

              totalRoles: totalUsers,

              startRoles: offset,

              endRoles: offset + pageSize,

              search

          });

      });

  });

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

module.exports = { createRoleWithPermissions, updateRoleWithPermissions, getAllRoles, deleteRoleById, getRolePermissionsById,List_Pub };
