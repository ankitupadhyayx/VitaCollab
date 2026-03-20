const rbac = require("../../shared/admin-rbac.json");

const ADMIN_ROLES = rbac.ADMIN_ROLES;
const TARGET_TYPES = rbac.TARGET_TYPES;
const ACTION_TYPES = rbac.ACTION_TYPES;
const PERMISSIONS = rbac.PERMISSIONS;

const ROLE_RANK = {
  MODERATOR: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3
};

module.exports = {
  ADMIN_ROLES,
  TARGET_TYPES,
  ACTION_TYPES,
  PERMISSIONS,
  ROLE_RANK
};
