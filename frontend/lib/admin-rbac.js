import rbac from "@shared/admin-rbac.json";

export const ADMIN_ROLES = rbac.ADMIN_ROLES;
export const PERMISSIONS = rbac.PERMISSIONS;

export const hasPermission = (adminRole, permission) => {
  if (!adminRole || !permission) {
    return false;
  }

  return (PERMISSIONS[permission] || []).includes(adminRole);
};
