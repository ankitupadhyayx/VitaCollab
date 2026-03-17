const { StatusCodes } = require("http-status-codes");
const { errorResponse } = require("../utils/apiResponse");

const authorize = (...allowedRoles) => (req, res, next) => {
  const userRole = req.user?.role;

  if (!userRole || !allowedRoles.includes(userRole)) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json(errorResponse({ message: "Access denied" }));
  }

  return next();
};

module.exports = {
  authorize
};
