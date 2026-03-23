const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");
const mongoose = require("mongoose");
const { StatusCodes } = require("http-status-codes");
const { User, Record, AuditLog, Notification } = require("../models");
const { successResponse } = require("../utils/apiResponse");
const { uploadBufferToCloudinary, cloudinaryEnabled } = require("../utils/cloudinary");
const { signQrToken, verifyQrToken } = require("../utils/authTokens");
const { logAdminAudit } = require("../services/audit.service");
const { evaluateRisk } = require("../services/risk.service");
const { ADMIN_EVENTS, realtimeBroker } = require("../services/realtime.service");
const adminUserService = require("../services/admin-user.service");
const { ROLE_RANK } = require("../constants/admin-rbac");
const env = require("../utils/env");
const { API_MESSAGES } = require("../utils/apiMessages");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  adminRole: user.adminRole || null,
  profileImageUrl: user.profileImageUrl,
  patientProfile: user.patientProfile,
  hospitalProfile: user.hospitalProfile,
  verified: user.verified,
  isVerified: user.isVerified,
  isHospitalVerified: user.isHospitalVerified,
  accountStatus: user.accountStatus,
  suspendedUntil: user.suspendedUntil,
  statusReason: user.statusReason,
  riskMetadata: user.riskMetadata || null,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt
});

const createAuditLog = async (userId, action, metadata = null) => {
  logAdminAudit({
    action,
    actionType: null,
    performedBy: userId,
    targetType: "SYSTEM",
    targetId: null,
    metadata
  });
};

const canMutateAdminTarget = (actorAdminRole, targetAdminRole) => {
  const actorRank = ROLE_RANK[actorAdminRole] || 0;
  const targetRank = ROLE_RANK[targetAdminRole] || 0;
  return actorRank > targetRank;
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
        message: API_MESSAGES.COMMON.USER_NOT_FOUND
      });
    }

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: API_MESSAGES.USERS.PROFILE_FETCHED,
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
        message: API_MESSAGES.COMMON.USER_NOT_FOUND
      });
    }

    if (user.isVerified !== true && user.verified !== true) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: API_MESSAGES.COMMON.EMAIL_VERIFICATION_REQUIRED
      });
    }

    const {
      name,
      phone,
      age,
      gender,
      bloodGroup,
      dob,
      allergies,
      medicalConditions,
      medications,
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
      const parseStringList = (value) => {
        if (Array.isArray(value)) {
          return value.map((item) => String(item).trim()).filter(Boolean);
        }

        if (typeof value === "string") {
          return value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
        }

        return undefined;
      };

      user.patientProfile = {
        ...(user.patientProfile || {}),
        ...(typeof phone === "string" ? { phone: phone.trim() } : {}),
        ...(typeof age !== "undefined" && age !== "" ? { age: Number(age) } : {}),
        ...(typeof gender === "string" ? { gender } : {}),
        ...(typeof bloodGroup === "string" ? { bloodGroup } : {}),
        ...(typeof emergencyContact === "string" ? { emergencyContact: emergencyContact.trim() } : {}),
        ...(typeof address === "string" ? { address: address.trim() } : {}),
        ...(typeof dob === "string" && dob ? { dob: new Date(dob) } : {}),
        ...(parseStringList(allergies) ? { allergies: parseStringList(allergies) } : {}),
        ...(parseStringList(medicalConditions) ? { medicalConditions: parseStringList(medicalConditions) } : {}),
        ...(parseStringList(medications) ? { medications: parseStringList(medications) } : {})
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
        message: API_MESSAGES.USERS.PROFILE_UPDATED,
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
        message: API_MESSAGES.COMMON.USER_NOT_FOUND
      });
    }

    const token = signQrToken({
      sub: user._id.toString(),
      role: user.role,
      type: "patient-identity"
    });

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: API_MESSAGES.USERS.QR_TOKEN_CREATED,
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
        message: API_MESSAGES.USERS.QR_TOKEN_INVALID
      });
    }

    const patient = await User.findById(decoded.sub);
    if (!patient || patient.role !== "patient") {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: API_MESSAGES.USERS.PATIENT_NOT_FOUND
      });
    }

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: API_MESSAGES.USERS.PATIENT_PROFILE_RESOLVED,
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
        message: API_MESSAGES.USERS.QR_TOKEN_INVALID_OR_EXPIRED
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
      User.countDocuments({ role: "hospital", isHospitalVerified: true }),
      Record.countDocuments({ status: "rejected" }),
      Record.countDocuments({}),
      Record.countDocuments({ status: "approved" }),
      User.countDocuments({
        role: "hospital",
        $or: [{ verified: true }, { isVerified: true }],
        isHospitalVerified: { $ne: true }
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
        message: API_MESSAGES.USERS.ADMIN_STATS_FETCHED,
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
        message: API_MESSAGES.USERS.AUDIT_LOGS_FETCHED,
        data: {
          logs: logs.map((log) => ({
            id: log._id,
            userId: log.userId,
            performedBy: log.performedBy,
            action: log.action,
            actionType: log.actionType,
            targetType: log.targetType,
            targetId: log.targetId,
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
      .select("name email role adminRole accountStatus suspendedUntil statusReason profileImageUrl patientProfile hospitalProfile verified isVerified isHospitalVerified createdAt lastLoginAt riskMetadata");

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: API_MESSAGES.USERS.USERS_FETCHED,
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
        message: API_MESSAGES.COMMON.INVALID_USER_ID
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: API_MESSAGES.COMMON.USER_NOT_FOUND
      });
    }

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: API_MESSAGES.USERS.USER_FETCHED,
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
        message: API_MESSAGES.COMMON.INVALID_USER_ID
      });
    }

    if (!["active", "suspended", "blocked"].includes(status)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: API_MESSAGES.USERS.INVALID_ACCOUNT_STATUS
      });
    }

    const user = await User.findById(id).select("+refreshTokenHash");
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: API_MESSAGES.COMMON.USER_NOT_FOUND
      });
    }

    if (user.role === "admin" && status !== "active") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: API_MESSAGES.USERS.ADMIN_STATUS_CHANGE_BLOCKED
      });
    }

    if (user.role === "admin" && user.adminRole && !canMutateAdminTarget(req.user.adminRole, user.adminRole)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: API_MESSAGES.USERS.ADMIN_HIERARCHY_MODIFY_BLOCKED
      });
    }

    user.accountStatus = status;
    user.statusReason = typeof reason === "string" && reason.trim() ? reason.trim() : null;
    user.suspendedUntil = status === "suspended" && suspendedUntil ? new Date(suspendedUntil) : null;
    user.riskMetadata = {
      ...(user.riskMetadata || {}),
      ...(status === "blocked" ? { score: 95, level: "HIGH" } : {}),
      ...(status === "suspended" ? { score: 70, level: "HIGH" } : {}),
      ...(status === "active" ? { score: 10, level: "LOW" } : {}),
      lastEvaluatedAt: new Date()
    };

    if (status !== "active") {
      user.refreshTokenHash = null;
    }

    await user.save();

    logAdminAudit({
      action: "admin.user.status_updated",
      actionType: status === "blocked" ? "USER_BLOCKED" : status === "suspended" ? "USER_SUSPENDED" : "USER_ACTIVATED",
      performedBy: req.user.id,
      targetType: "USER",
      targetId: user._id,
      metadata: {
        targetUserId: user._id,
        status,
        reason: user.statusReason,
        suspendedUntil: user.suspendedUntil
      }
    });

    realtimeBroker.publish(ADMIN_EVENTS.USER_UPDATED, {
      id: user._id.toString(),
      accountStatus: user.accountStatus,
      adminRole: user.adminRole || null,
      updatedAt: new Date().toISOString()
    });

    realtimeBroker.publish(ADMIN_EVENTS.AUDIT_NEW, {
      actionType: status === "blocked" ? "USER_BLOCKED" : status === "suspended" ? "USER_SUSPENDED" : "USER_ACTIVATED",
      targetType: "USER",
      targetId: user._id.toString(),
      timestamp: new Date().toISOString()
    });

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: API_MESSAGES.USERS.USER_STATUS_UPDATED,
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
        message: API_MESSAGES.USERS.ACTIVITY_FEED_FETCHED,
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
      .select("name email role adminRole lastLoginAt accountStatus riskMetadata");

    const suspicious = await Promise.all(
      sessions.map(async (user) => {
        const flaggedRecords = await Record.countDocuments({ suspiciousFlaggedBy: user._id });
        const riskInput = {
          failedLoginCount: Number(user.riskMetadata?.failedLoginCount || 0),
          deleteActionCount: Number(user.riskMetadata?.deleteActionCount || 0),
          rateLimitHits: Number(user.riskMetadata?.rateLimitHits || 0) + (flaggedRecords > 0 ? 3 : 0)
        };
        const risk = evaluateRisk(riskInput);
        return {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          adminRole: user.adminRole || null,
          accountStatus: user.accountStatus,
          lastLoginAt: user.lastLoginAt,
          suspiciousScore: risk.score,
          riskLevel: risk.level,
          riskMetadata: {
            ...riskInput,
            lastEvaluatedAt: new Date().toISOString()
          }
        };
      })
    );

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: API_MESSAGES.USERS.ACTIVE_SESSIONS_FETCHED,
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
        message: API_MESSAGES.COMMON.INVALID_USER_ID
      });
    }

    const user = await User.findById(id).select("+refreshTokenHash");
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: API_MESSAGES.COMMON.USER_NOT_FOUND
      });
    }

    user.refreshTokenHash = null;
    await user.save();

    logAdminAudit({
      action: "admin.session.force_logout",
      actionType: "USER_FORCE_LOGOUT",
      performedBy: req.user.id,
      targetType: "USER",
      targetId: user._id,
      metadata: {
        targetUserId: user._id,
        targetEmail: user.email
      }
    });

    realtimeBroker.publish(ADMIN_EVENTS.USER_UPDATED, {
      id: user._id.toString(),
      forceLoggedOut: true,
      updatedAt: new Date().toISOString()
    });

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: API_MESSAGES.USERS.USER_SESSION_REVOKED
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
          message: API_MESSAGES.USERS.NO_USERS_FOR_BROADCAST
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

    logAdminAudit({
      action: "admin.broadcast.sent",
      actionType: "BROADCAST_SENT",
      performedBy: req.user.id,
      targetType: "SYSTEM",
      targetId: null,
      metadata: {
        recipients: users.length,
        messagePreview: message.slice(0, 80)
      }
    });

    realtimeBroker.publish(ADMIN_EVENTS.AUDIT_NEW, {
      actionType: "BROADCAST_SENT",
      targetType: "SYSTEM",
      targetId: null,
      timestamp: new Date().toISOString()
    });

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: API_MESSAGES.USERS.SYSTEM_ANNOUNCEMENT_BROADCASTED,
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
      $or: [{ verified: true }, { isVerified: true }],
      isHospitalVerified: { $ne: true }
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("name email verified isHospitalVerified hospitalProfile createdAt");

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: API_MESSAGES.USERS.PENDING_HOSPITALS_FETCHED,
        data: {
          hospitals: hospitals.map((hospital) => ({
            id: hospital._id,
            name: hospital.name,
            email: hospital.email,
            verified: hospital.verified,
            isHospitalVerified: hospital.isHospitalVerified,
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
        message: API_MESSAGES.COMMON.INVALID_HOSPITAL_ID
      });
    }

    const hospital = await User.findOne({ _id: id, role: "hospital" });

    if (!hospital) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: API_MESSAGES.USERS.HOSPITAL_NOT_FOUND
      });
    }

    const hospitalEmailVerified = hospital.isVerified === true || hospital.verified === true;

    if (!hospitalEmailVerified) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: API_MESSAGES.USERS.HOSPITAL_EMAIL_NOT_VERIFIED
      });
    }

    if (hospital.isHospitalVerified === true || hospital.hospitalProfile?.verifiedByAdmin) {
      return res.status(StatusCodes.OK).json(
        successResponse({
          message: API_MESSAGES.USERS.HOSPITAL_ALREADY_VERIFIED,
          data: {
            hospital: {
              id: hospital._id,
              name: hospital.name,
              email: hospital.email,
              verifiedByAdmin: true,
              isHospitalVerified: true
            }
          }
        })
      );
    }

    hospital.hospitalProfile = {
      ...(hospital.hospitalProfile || {}),
      verifiedByAdmin: true
    };
    hospital.isHospitalVerified = true;
    await hospital.save();

    logAdminAudit({
      action: "hospital.verified",
      actionType: "HOSPITAL_VERIFIED",
      performedBy: req.user.id,
      targetType: "USER",
      targetId: hospital._id,
      metadata: {
        hospitalId: hospital._id,
        hospitalEmail: hospital.email
      }
    });

    realtimeBroker.publish(ADMIN_EVENTS.USER_UPDATED, {
      id: hospital._id.toString(),
      hospitalVerified: true,
      updatedAt: new Date().toISOString()
    });

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: API_MESSAGES.USERS.HOSPITAL_VERIFIED_SUCCESS,
        data: {
          hospital: {
            id: hospital._id,
            name: hospital.name,
            email: hospital.email,
            verifiedByAdmin: true,
            isHospitalVerified: true
          }
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const bulkUsersActionAdmin = async (req, res, next) => {
  try {
    const { action, ids, reason } = req.body;

    const status =
      action === "SUSPEND" ? "suspended" : action === "BLOCK" ? "blocked" : action === "ACTIVATE" ? "active" : null;
    const uniqueIds = [...new Set(ids)];

    const users = await User.find({ _id: { $in: uniqueIds } }).select("role adminRole accountStatus suspendedUntil statusReason riskMetadata");
    const foundMap = new Map(users.map((item) => [item._id.toString(), item]));

    const result = {
      succeeded: [],
      failed: []
    };

    for (const id of uniqueIds) {
      const user = foundMap.get(id);
      if (!user) {
        result.failed.push({ id, reason: API_MESSAGES.USERS.BATCH_REASON_USER_NOT_FOUND });
        continue;
      }

      if (user.role === "admin" && user.adminRole && !canMutateAdminTarget(req.user.adminRole, user.adminRole)) {
        result.failed.push({ id, reason: API_MESSAGES.USERS.BATCH_REASON_ADMIN_HIERARCHY_BLOCKED });
        continue;
      }

      if (action !== "VERIFY_HOSPITAL" && user.role === "admin" && status !== "active") {
        result.failed.push({ id, reason: API_MESSAGES.USERS.BATCH_REASON_ADMIN_STATUS_CHANGE_BLOCKED });
        continue;
      }

      if (action === "VERIFY_HOSPITAL") {
        if (user.role !== "hospital") {
          result.failed.push({ id, reason: API_MESSAGES.USERS.BATCH_REASON_ONLY_HOSPITAL_VERIFY });
          continue;
        }

        const userVerified = user.isVerified === true || user.verified === true;
        if (!userVerified) {
          result.failed.push({ id, reason: API_MESSAGES.USERS.BATCH_REASON_HOSPITAL_EMAIL_NOT_VERIFIED });
          continue;
        }

        user.hospitalProfile = {
          ...(user.hospitalProfile || {}),
          verifiedByAdmin: true
        };
        user.isHospitalVerified = true;
        user.statusReason = reason || user.statusReason || null;
        await user.save();

        result.succeeded.push({ id, isHospitalVerified: true });

        realtimeBroker.publish(ADMIN_EVENTS.USER_UPDATED, {
          id,
          isHospitalVerified: true,
          updatedAt: new Date().toISOString()
        });
        continue;
      }

      if (!status) {
        result.failed.push({ id, reason: API_MESSAGES.USERS.BATCH_REASON_INVALID_ACTION });
        continue;
      }

      user.accountStatus = status;
      user.statusReason = reason || null;
      user.suspendedUntil = status === "suspended" ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) : null;
      user.riskMetadata = {
        ...(user.riskMetadata || {}),
        ...(status === "blocked" ? { score: 95, level: "HIGH" } : {}),
        ...(status === "suspended" ? { score: 70, level: "HIGH" } : {}),
        ...(status === "active" ? { score: 10, level: "LOW" } : {}),
        lastEvaluatedAt: new Date()
      };

      await user.save();

      result.succeeded.push({ id, status: user.accountStatus });

      realtimeBroker.publish(ADMIN_EVENTS.USER_UPDATED, {
        id,
        accountStatus: user.accountStatus,
        updatedAt: new Date().toISOString()
      });
    }

    logAdminAudit({
      action: "admin.user.bulk_action",
      actionType: "BULK_USERS_ACTION",
      performedBy: req.user.id,
      targetType: "USER",
      targetId: null,
      metadata: {
        action,
        total: uniqueIds.length,
        successCount: result.succeeded.length,
        failureCount: result.failed.length
      }
    });

    realtimeBroker.publish(ADMIN_EVENTS.AUDIT_NEW, {
      actionType: "BULK_USERS_ACTION",
      targetType: "USER",
      targetId: null,
      timestamp: new Date().toISOString()
    });

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: API_MESSAGES.USERS.BULK_USER_ACTION_COMPLETED,
        data: {
          action,
          total: uniqueIds.length,
          ...result
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const streamCsv = async (res, headers, cursor) => {
  const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.write(`${headers.join(",")}\n`);

  // Cursor-based streaming prevents memory spikes for full dataset exports.
  for await (const row of cursor) {
    const line = headers.map((header) => escapeCsv(row[header])).join(",");
    res.write(`${line}\n`);
  }

  res.end();
};

const exportAdminData = async (req, res, next) => {
  try {
    const { type, mode, filters } = req.query;
    const parsedFilters = (() => {
      if (!filters) {
        return {};
      }
      try {
        return JSON.parse(filters);
      } catch {
        return {};
      }
    })();

    if (type === "users") {
      const query = mode === "full" ? {} : parsedFilters;
      const usersCursor = User.find(query)
        .sort({ createdAt: -1 })
        .select("name email role adminRole accountStatus lastLoginAt createdAt")
        .lean()
        .cursor();
      await streamCsv(res, ["name", "email", "role", "adminRole", "accountStatus", "lastLoginAt", "createdAt"], usersCursor);
      return;
    }

    if (type === "records") {
      const query = mode === "full" ? {} : parsedFilters;
      const recordsCursor = Record.find(query)
        .sort({ createdAt: -1 })
        .select("type status hospitalName patientId createdAt")
        .lean()
        .cursor();
      await streamCsv(res, ["type", "status", "hospitalName", "patientId", "createdAt"], recordsCursor);
      return;
    }

    if (type === "activity") {
      const query = mode === "full" ? {} : parsedFilters;
      const activityCursor = AuditLog.find(query)
        .sort({ timestamp: -1 })
        .select("action actionType userId timestamp")
        .lean()
        .cursor();
      await streamCsv(res, ["action", "actionType", "userId", "timestamp"], activityCursor);
      return;
    }

    const query = mode === "full" ? {} : parsedFilters;
    const logsCursor = AuditLog.find(query)
      .sort({ timestamp: -1 })
      .select("action actionType targetType targetId userId timestamp")
      .lean()
      .cursor();
    await streamCsv(res, ["action", "actionType", "targetType", "targetId", "userId", "timestamp"], logsCursor);
  } catch (error) {
    return next(error);
  }
};

const createAdminUser = async (req, res, next) => {
  try {
    const { name, email, password, adminRole } = req.body;

    if (!canMutateAdminTarget(req.user.adminRole, adminRole)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: API_MESSAGES.USERS.ADMIN_CREATE_HIERARCHY_BLOCKED
      });
    }

    let user;
    try {
      user = await adminUserService.createAdminAccount({ name, email, password, adminRole });
    } catch (error) {
      if (error?.code === "EMAIL_EXISTS") {
        return res.status(StatusCodes.CONFLICT).json({
          success: false,
          message: API_MESSAGES.USERS.EMAIL_ALREADY_EXISTS
        });
      }
      throw error;
    }

    if (!user) {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: API_MESSAGES.USERS.ADMIN_CREATE_FAILED
      });
    }

    logAdminAudit({
      action: "admin.user.created",
      actionType: "ADMIN_CREATED",
      performedBy: req.user.id,
      targetType: "ADMIN",
      targetId: user._id,
      metadata: {
        email: user.email,
        adminRole
      }
    });

    realtimeBroker.publish(ADMIN_EVENTS.USER_UPDATED, {
      id: user._id.toString(),
      role: user.role,
      adminRole: user.adminRole,
      createdAt: user.createdAt
    });

    return res.status(StatusCodes.CREATED).json(
      successResponse({
        message: API_MESSAGES.USERS.ADMIN_CREATED,
        data: {
          user: sanitizeUser(user)
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const updateAdminUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const target = await adminUserService.getAdminAccount(id);

    if (!target || target.role !== "admin") {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: API_MESSAGES.USERS.ADMIN_NOT_FOUND
      });
    }

    if (!canMutateAdminTarget(req.user.adminRole, target.adminRole)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: API_MESSAGES.USERS.ADMIN_UPDATE_HIERARCHY_BLOCKED
      });
    }

    if (req.body.adminRole && !canMutateAdminTarget(req.user.adminRole, req.body.adminRole)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: API_MESSAGES.USERS.ADMIN_ASSIGN_HIERARCHY_BLOCKED
      });
    }

    const updated = await adminUserService.updateAdminAccount(id, req.body);

    logAdminAudit({
      action: "admin.user.updated",
      actionType: "ADMIN_UPDATED",
      performedBy: req.user.id,
      targetType: "ADMIN",
      targetId: updated._id,
      metadata: {
        adminRole: updated.adminRole,
        accountStatus: updated.accountStatus
      }
    });

    realtimeBroker.publish(ADMIN_EVENTS.USER_UPDATED, {
      id: updated._id.toString(),
      adminRole: updated.adminRole,
      accountStatus: updated.accountStatus,
      updatedAt: new Date().toISOString()
    });

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: API_MESSAGES.USERS.ADMIN_UPDATED,
        data: {
          user: sanitizeUser(updated)
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const deleteAdminUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: API_MESSAGES.USERS.ADMIN_DELETE_SELF_BLOCKED
      });
    }

    const target = await adminUserService.getAdminAccount(id);
    if (!target || target.role !== "admin") {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: API_MESSAGES.USERS.ADMIN_NOT_FOUND
      });
    }

    if (!canMutateAdminTarget(req.user.adminRole, target.adminRole)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: API_MESSAGES.USERS.ADMIN_DELETE_HIERARCHY_BLOCKED
      });
    }

    await adminUserService.deleteAdminAccount(id);

    logAdminAudit({
      action: "admin.user.deleted",
      actionType: "ADMIN_DELETED",
      performedBy: req.user.id,
      targetType: "ADMIN",
      targetId: id,
      metadata: {
        deletedAdminId: id,
        deletedAdminEmail: target.email
      }
    });

    realtimeBroker.publish(ADMIN_EVENTS.USER_UPDATED, {
      id,
      deleted: true,
      updatedAt: new Date().toISOString()
    });

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: API_MESSAGES.USERS.ADMIN_DELETED
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
  bulkUsersActionAdmin,
  exportAdminData,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  listActivityFeedAdmin,
  listActiveSessionsAdmin,
  forceLogoutUserAdmin,
  broadcastSystemAnnouncementAdmin
};
