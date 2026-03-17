const { StatusCodes } = require("http-status-codes");
const { successResponse } = require("../utils/apiResponse");

const getHealth = (req, res) => {
  return res.status(StatusCodes.OK).json(
    successResponse({
      message: "VitaCollab backend is healthy",
      data: {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development"
      }
    })
  );
};

module.exports = {
  getHealth
};
