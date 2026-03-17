const mongoose = require("mongoose");
const { StatusCodes } = require("http-status-codes");
const { User, Record, AuditLog } = require("../models");
const { successResponse } = require("../utils/apiResponse");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const getAdminStats = async (req, res, next) => {
  try {
    const [activePatients, hospitalsVerified, openDisputes, totalRecords, pendingHospitalVerifications] = await Promise.all([
      User.countDocuments({ role: "patient", verified: true }),
      User.countDocuments({ role: "hospital", "hospitalProfile.verifiedByAdmin": true }),
      Record.countDocuments({ status: "rejected" }),
      Record.countDocuments({}),
      User.countDocuments({
        role: "hospital",
        verified: true,
        "hospitalProfile.verifiedByAdmin": { $ne: true }
      })
    ]);

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "Admin stats fetched",
        data: {
          metrics: {
            activePatients,
            hospitalsVerified,
            pendingHospitalVerifications,
            openDisputes,
            totalRecords,
            apiHealth: "99.97%"
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
    const logs = await AuditLog.find({}).sort({ timestamp: -1 }).limit(limit);

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
  getAdminStats,
  getAuditLogs,
  listPendingHospitals,
  verifyHospital
};
