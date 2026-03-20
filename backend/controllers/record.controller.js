const mongoose = require("mongoose");
const { StatusCodes } = require("http-status-codes");
const { Record } = require("../models/record.model");
const { User, Notification, AuditLog } = require("../models");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { uploadBufferToCloudinary } = require("../utils/cloudinary");
const { encryptText, decryptText } = require("../utils/encryption");
const { logAdminAudit } = require("../services/audit.service");
const { ADMIN_EVENTS, realtimeBroker } = require("../services/realtime.service");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const buildVisibilityFilter = (user) => {
  if (user.role === "admin") {
    return {};
  }

  if (user.role === "patient") {
    return { patientId: user.id };
  }

  return {
    $or: [
      { hospitalId: user.id },
      { status: "approved" }
    ]
  };
};

const sanitizeRecord = (record, includeReason = false) => {
  const payload = {
    id: record._id,
    patientId: record.patientId,
    hospitalId: record.hospitalId,
    hospitalName: record.hospitalName,
    type: record.type,
    description: record.description,
    fileUrl: record.fileUrl,
    filePath: record.filePath,
    cloudinaryPublicId: record.cloudinaryPublicId,
    fileResourceType: record.fileResourceType,
    fileMimeType: record.fileMimeType,
    fileSize: record.fileSize,
    status: record.status,
    recordDate: record.recordDate,
    approvedAt: record.approvedAt,
    rejectedAt: record.rejectedAt,
    flaggedSuspicious: record.flaggedSuspicious,
    suspiciousFlagReason: record.suspiciousFlagReason,
    suspiciousFlaggedAt: record.suspiciousFlaggedAt,
    suspiciousFlaggedBy: record.suspiciousFlaggedBy,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };

  if (includeReason) {
    payload.rejectionReason = record.encryptedRejectionReason
      ? decryptText(record.encryptedRejectionReason)
      : null;
  }

  return payload;
};

const uploadRecord = async (req, res, next) => {
  try {
    const { patientId, type, description, recordDate } = req.body;

    if (!req.file) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse({ message: "Medical file is required" }));
    }

    const patientLookup = isValidObjectId(patientId)
      ? { _id: patientId, role: "patient" }
      : { email: String(patientId).toLowerCase().trim(), role: "patient" };

    const patient = await User.findOne(patientLookup);
    if (!patient || patient.role !== "patient") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse({ message: "Valid patient identifier is required" }));
    }

    const hospital = await User.findById(req.user.id);
    if (!hospital) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(errorResponse({ message: "Invalid hospital context" }));
    }

    if (req.user.role === "hospital" && !hospital.hospitalProfile?.verifiedByAdmin) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(errorResponse({ message: "Hospital is pending admin verification" }));
    }

    const cloudinaryFile = await uploadBufferToCloudinary(
      req.file.buffer,
      `vitacollab/records/${patientId}`,
      "auto"
    );

    const record = await Record.create({
      patientId: patient._id,
      hospitalId: req.user.id,
      hospitalName: hospital.name,
      type,
      description,
      fileUrl: cloudinaryFile.url,
      cloudinaryPublicId: cloudinaryFile.publicId,
      fileResourceType: cloudinaryFile.resourceType,
      fileMimeType: req.file.mimetype,
      fileSize: req.file.size,
      status: "pending",
      recordDate: recordDate ? new Date(recordDate) : new Date()
    });

    await Promise.all([
      Notification.create({
        userId: patient._id,
        type: "approval_request",
        message: `${hospital.name} uploaded a ${type} record for your approval`
      }),
      AuditLog.create({
        userId: req.user.id,
        action: "record.uploaded",
        metadata: {
          recordId: record._id,
          patientId: patient._id,
          type
        }
      })
    ]);

    return res.status(StatusCodes.CREATED).json(
      successResponse({
        message: "Record uploaded and awaiting patient approval",
        data: {
          record: sanitizeRecord(record)
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const listRecords = async (req, res, next) => {
  try {
    const { status, type, search, patientId, page, limit } = req.query;

    const filter = {
      ...buildVisibilityFilter(req.user)
    };

    if (status) {
      filter.status = status;
    }

    if (type) {
      filter.type = type;
    }

    if (patientId) {
      if (!isValidObjectId(patientId)) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(errorResponse({ message: "Invalid patientId" }));
      }
      filter.patientId = patientId;
    }

    if (search) {
      filter.$and = [
        ...(filter.$and || []),
        {
          $or: [
            { description: { $regex: search, $options: "i" } },
            { hospitalName: { $regex: search, $options: "i" } },
            { type: { $regex: search, $options: "i" } }
          ]
        }
      ];
    }

    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      Record.find(filter)
        .sort({ recordDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Record.countDocuments(filter)
    ]);

    const includeRejectionReason = req.user.role === "patient" || req.user.role === "admin";

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "Records fetched successfully",
        data: {
          records: records.map((record) => sanitizeRecord(record, includeRejectionReason)),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const getRecordById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse({ message: "Invalid record id" }));
    }

    const record = await Record.findById(id).select("+encryptedRejectionReason");

    if (!record) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(errorResponse({ message: "Record not found" }));
    }

    const visibility = buildVisibilityFilter(req.user);
    const isVisible = await Record.exists({ _id: id, ...visibility });

    if (!isVisible) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(errorResponse({ message: "Access denied for this record" }));
    }

    const includeRejectionReason = req.user.role !== "hospital" || String(record.hospitalId) === req.user.id;

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "Record fetched successfully",
        data: {
          record: sanitizeRecord(record, includeRejectionReason)
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const decideRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { decision, rejectionReason } = req.body;

    if (!isValidObjectId(id)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse({ message: "Invalid record id" }));
    }

    const record = await Record.findById(id).select("+encryptedRejectionReason");

    if (!record) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(errorResponse({ message: "Record not found" }));
    }

    if (String(record.patientId) !== req.user.id) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(errorResponse({ message: "Only the patient can decide this record" }));
    }

    if (record.status !== "pending") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse({ message: "Only pending records can be updated" }));
    }

    if (decision === "approved") {
      record.status = "approved";
      record.approvedAt = new Date();
      record.rejectedAt = null;
      record.encryptedRejectionReason = null;
    } else {
      record.status = "rejected";
      record.rejectedAt = new Date();
      record.approvedAt = null;
      record.encryptedRejectionReason = encryptText(rejectionReason);
    }

    await record.save();

    await Promise.all([
      Notification.create({
        userId: record.hospitalId,
        type: decision === "approved" ? "record_approved" : "record_rejected",
        message:
          decision === "approved"
            ? `Patient approved record ${record._id}`
            : `Patient rejected record ${record._id}`
      }),
      AuditLog.create({
        userId: req.user.id,
        action: `record.${decision}`,
        metadata: {
          recordId: record._id,
          hospitalId: record.hospitalId,
          patientId: record.patientId
        }
      })
    ]);

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: `Record ${decision} successfully`,
        data: {
          record: sanitizeRecord(record, true)
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const deleteRecord = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse({ message: "Invalid record id" }));
    }

    const record = await Record.findById(id);

    if (!record) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(errorResponse({ message: "Record not found" }));
    }

    const canDelete = req.user.role === "admin" || String(record.hospitalId) === req.user.id;

    if (!canDelete) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(errorResponse({ message: "Not allowed to delete this record" }));
    }

    if (record.status === "approved") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse({ message: "Approved records cannot be deleted" }));
    }

    await record.deleteOne();

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "Record deleted successfully"
      })
    );
  } catch (error) {
    return next(error);
  }
};

const getMyTimeline = async (req, res, next) => {
  try {
    const status = req.query.status || "approved";
    const allowed = new Set(["approved", "pending", "rejected"]);

    if (!allowed.has(status)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse({ message: "Invalid status for timeline" }));
    }

    const records = await Record.find({
      patientId: req.user.id,
      status
    })
      .sort({ recordDate: -1, createdAt: -1 })
      .limit(100)
      .select("+encryptedRejectionReason");

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "Timeline fetched successfully",
        data: {
          timeline: records.map((record) => sanitizeRecord(record, true))
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const adminForceRecordAction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason, flagReason } = req.body;

    if (!isValidObjectId(id)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse({ message: "Invalid record id" }));
    }

    const record = await Record.findById(id).select("+encryptedRejectionReason");
    if (!record) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(errorResponse({ message: "Record not found" }));
    }

    if (action === "approved") {
      record.status = "approved";
      record.approvedAt = new Date();
      record.rejectedAt = null;
      record.encryptedRejectionReason = null;
    }

    if (action === "rejected") {
      record.status = "rejected";
      record.rejectedAt = new Date();
      record.approvedAt = null;
      record.encryptedRejectionReason = encryptText(rejectionReason);
    }

    if (action === "flag_suspicious") {
      record.flaggedSuspicious = true;
      record.suspiciousFlagReason = flagReason;
      record.suspiciousFlaggedAt = new Date();
      record.suspiciousFlaggedBy = req.user.id;
    }

    await record.save();

    logAdminAudit({
      action: `admin.record.${action}`,
      actionType: action === "approved" ? "RECORD_APPROVED" : action === "rejected" ? "RECORD_REJECTED" : "RECORD_FLAGGED",
      performedBy: req.user.id,
      targetType: "RECORD",
      targetId: record._id,
      metadata: {
        recordId: record._id,
        patientId: record.patientId,
        hospitalId: record.hospitalId
      }
    });

    realtimeBroker.publish(ADMIN_EVENTS.RECORD_UPDATED, {
      id: record._id.toString(),
      status: record.status,
      flaggedSuspicious: record.flaggedSuspicious,
      updatedAt: new Date().toISOString()
    });

    realtimeBroker.publish(ADMIN_EVENTS.AUDIT_NEW, {
      actionType: action === "approved" ? "RECORD_APPROVED" : action === "rejected" ? "RECORD_REJECTED" : "RECORD_FLAGGED",
      targetType: "RECORD",
      targetId: record._id.toString(),
      timestamp: new Date().toISOString()
    });

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "Record action completed",
        data: {
          record: sanitizeRecord(record, true)
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const adminBulkRecordAction = async (req, res, next) => {
  try {
    const { action, ids, rejectionReason, flagReason } = req.body;
    const uniqueIds = [...new Set(ids)];

    const records = await Record.find({ _id: { $in: uniqueIds } }).select("status approvedAt rejectedAt encryptedRejectionReason flaggedSuspicious suspiciousFlagReason suspiciousFlaggedAt suspiciousFlaggedBy patientId hospitalId");
    const recordMap = new Map(records.map((record) => [record._id.toString(), record]));

    const result = {
      succeeded: [],
      failed: []
    };

    for (const id of uniqueIds) {
      const record = recordMap.get(id);
      if (!record) {
        result.failed.push({ id, reason: "Record not found" });
        continue;
      }

      if (action === "APPROVE") {
        record.status = "approved";
        record.approvedAt = new Date();
        record.rejectedAt = null;
        record.encryptedRejectionReason = null;
      }

      if (action === "REJECT") {
        record.status = "rejected";
        record.rejectedAt = new Date();
        record.approvedAt = null;
        record.encryptedRejectionReason = encryptText(rejectionReason);
      }

      if (action === "FLAG") {
        record.flaggedSuspicious = true;
        record.suspiciousFlagReason = flagReason;
        record.suspiciousFlaggedAt = new Date();
        record.suspiciousFlaggedBy = req.user.id;
      }

      await record.save();

      result.succeeded.push({ id, status: record.status, flaggedSuspicious: record.flaggedSuspicious });

      realtimeBroker.publish(ADMIN_EVENTS.RECORD_UPDATED, {
        id,
        status: record.status,
        flaggedSuspicious: record.flaggedSuspicious,
        updatedAt: new Date().toISOString()
      });
    }

    logAdminAudit({
      action: "admin.record.bulk_action",
      actionType: "BULK_RECORDS_ACTION",
      performedBy: req.user.id,
      targetType: "RECORD",
      targetId: null,
      metadata: {
        action,
        total: uniqueIds.length,
        successCount: result.succeeded.length,
        failureCount: result.failed.length
      }
    });

    realtimeBroker.publish(ADMIN_EVENTS.AUDIT_NEW, {
      actionType: "BULK_RECORDS_ACTION",
      targetType: "RECORD",
      targetId: null,
      timestamp: new Date().toISOString()
    });

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "Bulk record action executed",
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

module.exports = {
  uploadRecord,
  listRecords,
  getRecordById,
  decideRecord,
  deleteRecord,
  getMyTimeline,
  adminForceRecordAction,
  adminBulkRecordAction
};
