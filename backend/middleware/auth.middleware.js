const { StatusCodes } = require("http-status-codes");
const { User } = require("../models");
const { verifyAccessToken } = require("../utils/authTokens");
const { errorResponse } = require("../utils/apiResponse");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(errorResponse({ message: "Authentication required" }));
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(errorResponse({ message: "Invalid token" }));
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(errorResponse({ message: "Invalid or expired token" }));
    }

    const user = await User.findById(decoded.sub);
    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(errorResponse({ message: "User does not exist" }));
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      verified: user.verified
    };

    return next();
  } catch (error) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json(errorResponse({ message: "Unauthorized" }));
  }
};

module.exports = {
  authenticate
};
