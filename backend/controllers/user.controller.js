const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");
const mongoose = require("mongoose");
const { StatusCodes } = require("http-status-codes");
const { User, Record, AuditLog, Notification } = require("../models");
const { successResponse } = require("../utils/apiResponse");
const { uploadBufferToCloudinary, cloudinaryEnabled } = require("../utils/cloudinary");
const { signQrToken, verifyQrToken } = require("../utils/authTokens");
const env = require("../utils/env");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  profileImageUrl: user.profileImageUrl,
  patientProfile: user.patientProfile,
  hospitalProfile: user.hospitalProfile,
  verified: user.verified,
  isVerified: user.isVerified,
  accountStatus: user.accountStatus,
  suspendedUntil: user.suspendedUntil,
  statusReason: user.statusReason,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt
});

const createAuditLog = async (userId, action, metadata = null) => {
  await AuditLog.create({
    userId,
    action,
    metadata
  });
};

const uploadProfileImageLocally = async (req, role) => {
  const ext = path.extname(req.file.originalname || "").toLowerCase() || ".jpg";
  const safeRole = role === "hospital" ? "hospital" : "patient";
  const fileName = `${Date.now()}-${randomUUID()}${ext}`;
  const relativeDir = path.join("uploads", "profiles", safeRole);
  const absoluteDir = path.join(process.cwd(), relativeDir);
  const absolutePath = path.join(absoluteDir, fileName);

  await fs.mkdir(absoluteDir, { recursive: true });
  await fs.writeFile(absolutePath, req.file.buffer);

  return {
    url: `${req.protocol}://${req.get("host")}/${relativeDir.replace(/\\/g, "/")}/${fileName}`
  };
};

const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "Profile fetched",
        data: {
          user: sanitizeUser(user)
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.isVerified !== true && user.verified !== true) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "Please verify your email to update profile"
      });
    }

    const {
      name,
      phone,
      age,
      gender,
      bloodGroup,
      address,
      emergencyContact,
      hospitalName,
      licenseNumber,
      specialization,
      departments,
      contactEmail,
      contactPhone
    } = req.body;

    if (typeof name === "string" && name.trim()) {
      user.name = name.trim();
    }

    if (user.role === "patient") {
      user.patientProfile = {
        ...(user.patientProfile || {}),
        ...(typeof phone === "string" ? { phone: phone.trim() } : {}),
        ...(typeof age !== "undefined" && age !== "" ? { age: Number(age) } : {}),
        ...(typeof gender === "string" ? { gender } : {}),
        ...(typeof bloodGroup === "string" ? { bloodGroup } : {}),
        ...(typeof emergencyContact === "string" ? { emergencyContact: emergencyContact.trim() } : {}),
        ...(typeof address === "string" ? { address: address.trim() } : {})
      };
    }

    if (user.role === "hospital") {
      const parsedDepartments = typeof departments === "string"
        ? departments.split(",").map((item) => item.trim()).filter(Boolean)
        : Array.isArray(departments)
          ? departments.map((item) => String(item).trim()).filter(Boolean)
          : undefined;

      user.hospitalProfile = {
        ...(user.hospitalProfile || {}),
        ...(typeof hospitalName === "string" ? { hospitalName: hospitalName.trim() } : {}),
        ...(typeof licenseNumber === "string" ? { licenseNumber: licenseNumber.trim() } : {}),
        ...(typeof specialization === "string" ? { specialization: specialization.trim() } : {}),
        ...(typeof address === "string" ? { address: address.trim() } : {}),
        ...(typeof contactPhone === "string" ? { phone: contactPhone.trim() } : {}),
        ...(parsedDepartments ? { departments: parsedDepartments } : {})
      };

      if (typeof contactEmail === "string" && contactEmail.trim()) {
        user.email = contactEmail.trim().toLowerCase();
      }
    }

    if (req.file?.buffer) {
      let profileImage;
      try {
        if (cloudinaryEnabled) {
          profileImage = await uploadBufferToCloudinary(req.file.buffer, `vitacollab/profiles/${user.role}`, "image");
        } else {
          profileImage = await uploadProfileImageLocally(req, user.role);
        }
      } catch (uploadError) {
        if (env.nodeEnv === "development") {
          profileImage = await uploadProfileImageLocally(req, user.role);
        } else {
          throw uploadError;
        }
      }

      user.profileImageUrl = profileImage.url;
    }

    await user.save();

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "Profile updated",
        data: {
          user: sanitizeUser(user)
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const getMyQrToken = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User not found"
      });
    }

    const token = signQrToken({
      sub: user._id.toString(),
      role: user.role,
      type: "patient-identity"
    });

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "QR token created",
        data: {
          token,
          patientId: user._id.toString()
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const resolvePatientQr = async (req, res, next) => {
  try {
    const { token } = req.body;
    const decoded = verifyQrToken(token);

    if (!decoded?.sub || decoded?.type !== "patient-identity") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid QR token"
      });
    }

    const patient = await User.findById(decoded.sub);
    if (!patient || patient.role !== "patient") {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Patient not found"
      });
    }

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "Patient profile resolved",
        data: {
          patient: {
            id: patient._id,
            name: patient.name,
            email: patient.email,
            profileImageUrl: patient.profileImageUrl,
            patientProfile: patient.patientProfile,
            verified: patient.verified,
            isVerified: patient.isVerified
          }
        }
      })
    );
  } catch (error) {
    if (error?.name === "JsonWebTokenError" || error?.name === "TokenExpiredError") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid or expired QR token"
      });
    }
    return next(error);
  }
};

const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      activePatients,
      hospitalsVerified,
      openDisputes,
      totalRecords,
      approvedRecords,
      pendingHospitalVerifications,
      dailyActivity,
      growthTrend
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ accountStatus: "active" }),
      User.countDocuments({ role: "patient", verified: true }),
      User.countDocuments({ role: "hospital", "hospitalProfile.verifiedByAdmin": true }),
      Record.countDocuments({ status: "rejected" }),
      Record.countDocuments({}),
      Record.countDocuments({ status: "approved" }),
      User.countDocuments({
        role: "hospital",
        verified: true,
        "hospitalProfile.verifiedByAdmin": { $ne: true }
      }),
      AuditLog.aggregate([
        {
          $match: {
            timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$timestamp"
              }
            },
            value: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      User.aggregate([
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m",
                date: "$createdAt"
              }
            },
            value: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 6 }
      ])
    ]);

    const approvalRate = totalRecords > 0 ? Number(((approvedRecords / totalRecords) * 100).toFixed(2)) : 0;

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "Admin stats fetched",
        data: {
          metrics: {
            totalUsers,
            activeUsers,
            activePatients,
            hospitalsVerified,
            pendingHospitalVerifications,
            openDisputes,
            recordsUploaded: totalRecords,
            approvalRate,
            apiHealth: "99.97%"
          },
          charts: {
            dailyActivity: dailyActivity.map((item) => ({ name: item._id, value: item.value })),
            growthTrend: growthTrend.map((item) => ({ name: item._id, value: item.value }))
          }
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const userId = req.query.user;
    const action = req.query.action;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const filter = {};

    if (userId && isValidObjectId(userId)) {
      filter.userId = userId;
    }

    if (action) {
      filter.action = { $regex: action, $options: "i" };
    }

    if (startDate || endDate) {
      filter.timestamp = {
        ...(startDate ? { $gte: new Date(startDate) } : {}),
        ...(endDate ? { $lte: new Date(endDate) } : {})
      };
    }

    const logs = await AuditLog.find(filter).sort({ timestamp: -1 }).limit(limit);

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "Audit logs fetched",
        data: {
          logs: logs.map((log) => ({
            id: log._id,
            userId: log.userId,
            action: log.action,
            timestamp: log.timestamp,
            metadata: log.metadata
          }))
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const listUsersAdmin = async (req, res, next) => {
  try {
    const role = req.query.role;
    const status = req.query.status;
    const search = req.query.search;
    const limit = Math.min(Number(req.query.limit) || 50, 100);

    const filter = {};

    if (role && ["patient", "hospital", "admin"].includes(role)) {
      filter.role = role;
    }

    if (status && ["active", "suspended", "blocked"].includes(status)) {
      filter.accountStatus = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("name email role accountStatus suspendedUntil statusReason profileImageUrl patientProfile hospitalProfile verified isVerified createdAt lastLoginAt");

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "Users fetched",
        data: {
          users: users.map((user) => sanitizeUser(user))
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const getUserByIdAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid user id"
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "User fetched",
        data: {
          user: sanitizeUser(user)
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const updateUserStatusAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason, suspendedUntil } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid user id"
      });
    }

    if (!["active", "suspended", "blocked"].includes(status)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid account status"
      });
    }

    const user = await User.findById(id).select("+refreshTokenHash");
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role === "admin" && status !== "active") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Admin users cannot be suspended or blocked"
      });
    }

    user.accountStatus = status;
    user.statusReason = typeof reason === "string" && reason.trim() ? reason.trim() : null;
    user.suspendedUntil = status === "suspended" && suspendedUntil ? new Date(suspendedUntil) : null;

    if (status !== "active") {
      user.refreshTokenHash = null;
    }

    await user.save();

    await createAuditLog(req.user.id, "admin.user.status_updated", {
      targetUserId: user._id,
      status,
      reason: user.statusReason,
      suspendedUntil: user.suspendedUntil
    });

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "User status updated",
        data: {
          user: sanitizeUser(user)
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const listActivityFeedAdmin = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 30, 100);
    const actionFilter = req.query.action;
    const actionTypes = {
      uploads: /^record\.uploaded$/i,
      approvals: /^record\.(approved|rejected)$/i,
      logins: /^auth\.login$/i
    };

    const filter = actionFilter && actionTypes[actionFilter]
      ? { action: actionTypes[actionFilter] }
      : {};

    const logs = await AuditLog.find(filter).sort({ timestamp: -1 }).limit(limit);

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "Activity feed fetched",
        data: {
          activities: logs.map((log) => ({
            id: log._id,
            userId: log.userId,
            action: log.action,
            metadata: log.metadata,
            timestamp: log.timestamp
          }))
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const listActiveSessionsAdmin = async (req, res, next) => {
  try {
    const sessions = await User.find({ refreshTokenHash: { $ne: null } })
      .sort({ lastLoginAt: -1 })
      .select("name email role lastLoginAt accountStatus");

    const suspicious = await Promise.all(
      sessions.map(async (user) => {
        const flaggedRecords = await Record.countDocuments({ suspiciousFlaggedBy: user._id });
        return {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          accountStatus: user.accountStatus,
          lastLoginAt: user.lastLoginAt,
          suspiciousScore: flaggedRecords > 0 ? 80 : 10
        };
      })
    );

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "Active sessions fetched",
        data: {
          sessions: suspicious
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const forceLogoutUserAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid user id"
      });
    }

    const user = await User.findById(id).select("+refreshTokenHash");
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User not found"
      });
    }

    user.refreshTokenHash = null;
    await user.save();

    await createAuditLog(req.user.id, "admin.session.force_logout", {
      targetUserId: user._id,
      targetEmail: user.email
    });

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "User session revoked"
      })
    );
  } catch (error) {
    return next(error);
  }
};

const broadcastSystemAnnouncementAdmin = async (req, res, next) => {
  try {
    const { message } = req.body;

    const users = await User.find({}).select("_id");
    if (!users.length) {
      return res.status(StatusCodes.OK).json(
        successResponse({
          message: "No users available for broadcast"
        })
      );
    }

    await Notification.insertMany(
      users.map((user) => ({
        userId: user._id,
        type: "system",
        message
      }))
    );

    await createAuditLog(req.user.id, "admin.broadcast.sent", {
      recipients: users.length,
      messagePreview: message.slice(0, 80)
    });

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "System announcement broadcasted",
        data: {
          recipients: users.length
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const listPendingHospitals = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const hospitals = await User.find({
      role: "hospital",
      verified: true,
      "hospitalProfile.verifiedByAdmin": { $ne: true }
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("name email verified hospitalProfile createdAt");

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "Pending hospitals fetched",
        data: {
          hospitals: hospitals.map((hospital) => ({
            id: hospital._id,
            name: hospital.name,
            email: hospital.email,
            verified: hospital.verified,
            createdAt: hospital.createdAt,
            hospitalProfile: hospital.hospitalProfile
          }))
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const verifyHospital = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid hospital id"
      });
    }

    const hospital = await User.findOne({ _id: id, role: "hospital" });

    if (!hospital) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Hospital not found"
      });
    }

    if (!hospital.verified) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Hospital email is not verified yet"
      });
    }

    if (hospital.hospitalProfile?.verifiedByAdmin) {
      return res.status(StatusCodes.OK).json(
        successResponse({
          message: "Hospital already verified",
          data: {
            hospital: {
              id: hospital._id,
              name: hospital.name,
              email: hospital.email,
              verifiedByAdmin: true
            }
          }
        })
      );
    }

    hospital.hospitalProfile = {
      ...(hospital.hospitalProfile || {}),
      verifiedByAdmin: true
    };
    await hospital.save();

    await AuditLog.create({
      userId: req.user.id,
      action: "hospital.verified",
      metadata: {
        hospitalId: hospital._id,
        hospitalEmail: hospital.email
      }
    });

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "Hospital verified successfully",
        data: {
          hospital: {
            id: hospital._id,
            name: hospital.name,
            email: hospital.email,
            verifiedByAdmin: true
          }
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getMyQrToken,
  resolvePatientQr,
  getAdminStats,
  getAuditLogs,
  listPendingHospitals,
  verifyHospital,
  listUsersAdmin,
  getUserByIdAdmin,
  updateUserStatusAdmin,
  listActivityFeedAdmin,
  listActiveSessionsAdmin,
  forceLogoutUserAdmin,
  broadcastSystemAnnouncementAdmin
};
