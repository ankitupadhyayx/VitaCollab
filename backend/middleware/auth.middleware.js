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

    if (user.accountStatus === "blocked") {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(errorResponse({ message: "Your account has been blocked by admin" }));
    }

    if (user.accountStatus === "suspended") {
      const suspensionExpired = user.suspendedUntil && new Date(user.suspendedUntil).getTime() <= Date.now();

      if (suspensionExpired) {
        user.accountStatus = "active";
        user.suspendedUntil = null;
        user.statusReason = null;
        await user.save();
      } else {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse({ message: "Your account is currently suspended" }));
      }
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      adminRole: user.adminRole || null,
      email: user.email,
      verified: user.verified,
      isHospitalVerified: user.isHospitalVerified === true
    };

    return next();
  } catch (error) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json(errorResponse({ message: "Unauthorized" }));
  }
};

const requireHospitalVerified = async (req, res, next) => {
  try {
    if (req.user?.role !== "hospital") {
      return next();
    }

    const hospital = await User.findById(req.user.id).select("isHospitalVerified hospitalProfile");
    const isVerifiedByAdmin = hospital?.isHospitalVerified === true || hospital?.hospitalProfile?.verifiedByAdmin === true;

    if (!isVerifiedByAdmin) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(errorResponse({ message: "Hospital is pending admin verification" }));
    }

    return next();
  } catch (error) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json(errorResponse({ message: "Unauthorized" }));
  }
};

module.exports = {
  authenticate,
  requireHospitalVerified
};
