const { StatusCodes } = require("http-status-codes");
const logger = require("../utils/logger");
const { errorResponse } = require("../utils/apiResponse");

const notFoundHandler = (req, res) => {
  return res.status(StatusCodes.NOT_FOUND).json(
    errorResponse({
      message: `Route not found: ${req.method} ${req.originalUrl}`
    })
  );
};

const errorHandler = (err, req, res, next) => {
  logger.error("Unhandled error", {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method
  });

  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;

  return res.status(statusCode).json(
    errorResponse({
      message: err.message || "Internal server error"
    })
  );
};

module.exports = {
  notFoundHandler,
  errorHandler
};
