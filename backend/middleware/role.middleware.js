const { StatusCodes } = require("http-status-codes");
const { errorResponse } = require("../utils/apiResponse");
const { PERMISSIONS } = require("../constants/admin-rbac");

const authorize = (...allowedRoles) => (req, res, next) => {
  const userRole = req.user?.role;

  if (!userRole || !allowedRoles.includes(userRole)) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json(errorResponse({ message: "Access denied" }));
  }

  return next();
};

const requireRole = (...allowedAdminRoles) => (req, res, next) => {
  const userRole = req.user?.role;
  const adminRole = req.user?.adminRole;

  if (userRole !== "admin") {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json(errorResponse({ message: "Admin role required" }));
  }

  if (!adminRole || !allowedAdminRoles.includes(adminRole)) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json(errorResponse({ message: "Insufficient role hierarchy" }));
  }

  return next();
};

const requirePermission = (...requiredPermissions) => (req, res, next) => {
  const userRole = req.user?.role;
  const adminRole = req.user?.adminRole;

  if (userRole !== "admin" || !adminRole) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json(errorResponse({ message: "Admin permission required" }));
  }

  const missing = requiredPermissions.find((permission) => {
    const roles = PERMISSIONS[permission] || [];
    return !roles.includes(adminRole);
  });

  if (missing) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json(errorResponse({ message: "Insufficient permissions", code: "INSUFFICIENT_PERMISSION", permission: missing }));
  }

  return next();
};

module.exports = {
  authorize,
  requireRole,
  requirePermission
};
