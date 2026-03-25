const mongoose = require("mongoose");
const { StatusCodes } = require("http-status-codes");
const { Record } = require("../models/record.model");
const { User, Notification, RecordShareToken } = require("../models");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { uploadBufferToCloudinary, createSignedCloudinaryUrl, cloudinaryEnabled } = require("../utils/cloudinary");
const { encryptText, decryptText } = require("../utils/encryption");
const { hashToken } = require("../utils/authTokens");
const { createTokenWithHash } = require("../utils/cryptoTokens");
const { withRequestTiming } = require("../utils/requestTiming");
const { API_MESSAGES } = require("../utils/apiMessages");
const { logAdminAudit, logSecurityAudit } = require("../services/audit.service");
const { ADMIN_EVENTS, realtimeBroker } = require("../services/realtime.service");
const { canAccessRecord } = require("../services/recordAccess.service");
const env = require("../utils/env");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
const DEFAULT_SHARE_EXPIRY_MINUTES = Math.min(
  30,
  Math.max(15, Number(process.env.RECORD_SHARE_DEFAULT_EXPIRY_MINUTES || 20))
);

const buildFileAccessLinks = (recordId) => ({
  fileAccessUrl: `/api/v1/files/${recordId}`,
  fileDownloadUrl: `/api/v1/files/${recordId}?download=true`
});

const auditShareAccess = async ({ share, req, outcome, reason }) => {
  await logSecurityAudit({
    req,
    userId: share?.createdBy || req.user?.id || null,
    role: req.user?.role || "anonymous",
    action: outcome === "success" ? "share_accessed" : "share_access_denied",
    resourceId: share?.recordId || null,
    metadata: {
      shareId: share?._id || null,
      recordId: share?.recordId || null,
      outcome,
      reason,
      usedCount: share?.usedCount ?? null,
      maxUses: share?.maxUses ?? null
    }
  });
};

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
  const fileLinks = buildFileAccessLinks(record._id);
  const payload = {
    id: record._id,
    patientId: record.patientId,
    hospitalId: record.hospitalId,
    hospitalName: record.hospitalName,
    type: record.type,
    description: record.description,
    ...fileLinks,
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
        .json(errorResponse({ message: API_MESSAGES.RECORDS.MEDICAL_FILE_REQUIRED }));
    }

    const patientLookup = isValidObjectId(patientId)
      ? { _id: patientId, role: "patient" }
      : { email: String(patientId).toLowerCase().trim(), role: "patient" };

    const patient = await User.findOne(patientLookup);
    if (!patient || patient.role !== "patient") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse({ message: API_MESSAGES.RECORDS.VALID_PATIENT_IDENTIFIER_REQUIRED }));
    }

    const hospital = await User.findById(req.user.id);
    if (!hospital) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(errorResponse({ message: API_MESSAGES.COMMON.INVALID_HOSPITAL_CONTEXT }));
    }

    if (req.user.role === "hospital" && hospital.isHospitalVerified !== true) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(errorResponse({ message: API_MESSAGES.RECORDS.HOSPITAL_PENDING_VERIFICATION }));
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
      fileUrl: null,
      cloudinaryPublicId: cloudinaryFile.publicId,
      fileResourceType: cloudinaryFile.resourceType,
      fileMimeType: req.file.validatedMimeType || req.file.mimetype,
      fileSize: req.file.size,
      status: "pending",
      recordDate: recordDate ? new Date(recordDate) : new Date()
    });

    await Promise.all([
      Notification.create({
        userId: patient._id,
        type: "approval_request",
        message: API_MESSAGES.NOTIFICATIONS.RECORD_UPLOAD_APPROVAL({
          hospitalName: hospital.name,
          type
        })
      }),
      logSecurityAudit({
        req,
        userId: req.user.id,
        role: req.user.role,
        action: "record.create",
        resourceId: record._id,
        metadata: {
          recordId: record._id,
          patientId: patient._id,
          type
        }
      })
    ]);

    return res.status(StatusCodes.CREATED).json(
      successResponse({
        message: API_MESSAGES.RECORDS.RECORD_UPLOADED_PENDING_APPROVAL,
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
    const { status, type, search, patientId } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    return await withRequestTiming(
      {
        req,
        label: "records.list",
        meta: {
          page,
          limit,
          hasSearch: Boolean(search),
          hasStatus: Boolean(status),
          hasType: Boolean(type)
        }
      },
      async () => {
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
              .json(errorResponse({ message: API_MESSAGES.RECORDS.INVALID_PATIENT_ID }));
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
            message: API_MESSAGES.RECORDS.RECORDS_FETCHED,
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
      }
    );
  } catch (error) {
    return next(error);
  }
};

const getMyTimeline = async (req, res, next) => {
  try {
    return await withRequestTiming(
      {
        req,
        label: "records.timeline",
        meta: {
          status: req.query.status || "approved"
        }
      },
      async () => {
        const status = req.query.status || "approved";
        const allowed = new Set(["approved", "pending", "rejected"]);

        if (!allowed.has(status)) {
          return res
            .status(StatusCodes.BAD_REQUEST)
            .json(errorResponse({ message: API_MESSAGES.RECORDS.INVALID_TIMELINE_STATUS }));
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
            message: API_MESSAGES.RECORDS.TIMELINE_FETCHED,
            data: {
              timeline: records.map((record) => sanitizeRecord(record, true))
            }
          })
        );
      }
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
        .json(errorResponse({ message: API_MESSAGES.RECORDS.INVALID_RECORD_ID }));
    }

    const record = await Record.findById(id).select("+encryptedRejectionReason");

    if (!record) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(errorResponse({ message: API_MESSAGES.RECORDS.RECORD_NOT_FOUND }));
    }

    const visibility = buildVisibilityFilter(req.user);
    const isVisible = await Record.exists({ _id: id, ...visibility });

    if (!isVisible) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(errorResponse({ message: API_MESSAGES.RECORDS.RECORD_ACCESS_DENIED }));
    }

    const includeRejectionReason = req.user.role !== "hospital" || String(record.hospitalId) === req.user.id;

    await logSecurityAudit({
      req,
      userId: req.user.id,
      role: req.user.role,
      action: "record.view",
      resourceId: record._id,
      metadata: {
        recordId: record._id,
        status: record.status
      }
    });

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: API_MESSAGES.RECORDS.RECORD_FETCHED,
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
        .json(errorResponse({ message: API_MESSAGES.RECORDS.INVALID_RECORD_ID }));
    }

    const record = await Record.findById(id).select("+encryptedRejectionReason");

    if (!record) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(errorResponse({ message: API_MESSAGES.RECORDS.RECORD_NOT_FOUND }));
    }

    if (String(record.patientId) !== req.user.id) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(errorResponse({ message: API_MESSAGES.RECORDS.RECORD_DECISION_ONLY_PATIENT }));
    }

    if (record.status !== "pending") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse({ message: API_MESSAGES.RECORDS.RECORD_DECISION_PENDING_ONLY }));
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
            ? API_MESSAGES.NOTIFICATIONS.RECORD_APPROVED({ recordId: record._id })
            : API_MESSAGES.NOTIFICATIONS.RECORD_REJECTED({ recordId: record._id })
      }),
      logSecurityAudit({
        req,
        userId: req.user.id,
        role: req.user.role,
        action: "record.update",
        resourceId: record._id,
        metadata: {
          decision,
          recordId: record._id,
          hospitalId: record.hospitalId,
          patientId: record.patientId
        }
      })
    ]);

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: decision === "approved" ? API_MESSAGES.RECORDS.RECORD_APPROVED : API_MESSAGES.RECORDS.RECORD_REJECTED,
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
        .json(errorResponse({ message: API_MESSAGES.RECORDS.INVALID_RECORD_ID }));
    }

    const record = await Record.findById(id);

    if (!record) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(errorResponse({ message: API_MESSAGES.RECORDS.RECORD_NOT_FOUND }));
    }

    const canDelete = req.user.role === "admin" || String(record.hospitalId) === req.user.id;

    if (!canDelete) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(errorResponse({ message: API_MESSAGES.RECORDS.RECORD_DELETE_NOT_ALLOWED }));
    }

    if (record.status === "approved") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse({ message: API_MESSAGES.RECORDS.RECORD_DELETE_APPROVED_BLOCKED }));
    }

    await logSecurityAudit({
      req,
      userId: req.user.id,
      role: req.user.role,
      action: "record.delete",
      resourceId: record._id,
      metadata: {
        recordId: record._id,
        hospitalId: record.hospitalId,
        patientId: record.patientId
      }
    });

    await record.deleteOne();

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: API_MESSAGES.RECORDS.RECORD_DELETED
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
        .json(errorResponse({ message: API_MESSAGES.RECORDS.INVALID_RECORD_ID }));
    }

    const record = await Record.findById(id).select("+encryptedRejectionReason");
    if (!record) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(errorResponse({ message: API_MESSAGES.RECORDS.RECORD_NOT_FOUND }));
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
        message: API_MESSAGES.RECORDS.RECORD_ACTION_COMPLETED,
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
        result.failed.push({ id, reason: API_MESSAGES.RECORDS.BATCH_REASON_RECORD_NOT_FOUND });
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
        message: API_MESSAGES.RECORDS.RECORD_BULK_ACTION_COMPLETED,
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

const createRecordShareLink = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      expiresInMinutes = DEFAULT_SHARE_EXPIRY_MINUTES,
      recipientBound = false,
      oneTimeUse = false,
      maxUses,
      recipientEmail,
      recipientUserId
    } = req.body || {};

    if (!isValidObjectId(id)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse({ message: API_MESSAGES.RECORDS.INVALID_RECORD_ID }));
    }

    const visibility = buildVisibilityFilter(req.user);
    const record = await Record.findOne({ _id: id, ...visibility });

    if (!record) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(errorResponse({ message: API_MESSAGES.RECORDS.RECORD_NOT_FOUND }));
    }

    const { token, tokenHash } = createTokenWithHash();
    const isRecipientBound = recipientBound === true || Boolean(recipientUserId);
    if (isRecipientBound && !recipientUserId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse({ message: API_MESSAGES.RECORDS.SHARE_RECIPIENT_REQUIRED }));
    }

    const resolvedMaxUses = oneTimeUse ? 1 : Math.min(3, Math.max(1, Number(maxUses || 3)));
    const resolvedExpiryMinutes = Math.min(30, Math.max(15, Number(expiresInMinutes || DEFAULT_SHARE_EXPIRY_MINUTES)));
    const expiry = new Date(Date.now() + resolvedExpiryMinutes * 60 * 1000);

    const share = await RecordShareToken.create({
      recordId: record._id,
      createdBy: req.user.id,
      tokenHash,
      expiresAt: expiry,
      maxUses: resolvedMaxUses,
      recipientEmail: recipientEmail ? String(recipientEmail).toLowerCase().trim() : null,
      recipientUserId: isRecipientBound ? recipientUserId : null
    });

    await logSecurityAudit({
      req,
      userId: req.user.id,
      role: req.user.role,
      action: "share_created",
      resourceId: record._id,
      metadata: {
        shareId: share._id,
        recordId: record._id,
        expiresAt: expiry,
        maxUses: resolvedMaxUses
      }
    });

    const sharePageBaseUrl = env.clientUrl || `${req.protocol}://${req.get("host")}`;
    const shareUrl = `${sharePageBaseUrl}/share/${encodeURIComponent(token)}`;

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: API_MESSAGES.RECORDS.SHARE_LINK_GENERATED,
        data: {
          shareId: share._id,
          shareUrl,
          expiresAt: expiry,
          maxUses: resolvedMaxUses,
          oneTimeUse: resolvedMaxUses === 1,
          recipientBound: Boolean(share.recipientUserId)
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const getSharedRecordByToken = async (req, res, next) => {
  try {
    const { token } = req.params;
    const tokenHash = hashToken(token);
    const share = await RecordShareToken.findOne({ tokenHash });

    if (!share) {
      await auditShareAccess({
        share: null,
        req,
        outcome: "denied",
        reason: "invalid_or_unknown_token"
      });
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(errorResponse({ message: API_MESSAGES.RECORDS.SHARE_TOKEN_INVALID_OR_EXPIRED }));
    }

    if (share.revokedAt) {
      await auditShareAccess({
        share,
        req,
        outcome: "denied",
        reason: "revoked"
      });
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(errorResponse({ message: API_MESSAGES.RECORDS.SHARE_TOKEN_REVOKED }));
    }

    if (new Date(share.expiresAt).getTime() <= Date.now()) {
      await auditShareAccess({
        share,
        req,
        outcome: "denied",
        reason: "expired"
      });
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(errorResponse({ message: API_MESSAGES.RECORDS.SHARE_TOKEN_INVALID_OR_EXPIRED }));
    }

    if (share.usedCount >= share.maxUses) {
      await auditShareAccess({
        share,
        req,
        outcome: "denied",
        reason: "usage_limit_exceeded"
      });
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(errorResponse({ message: API_MESSAGES.RECORDS.SHARE_TOKEN_ALREADY_USED }));
    }

    if (share.recipientUserId) {
      if (!req.user || String(share.recipientUserId) !== String(req.user.id)) {
        await auditShareAccess({
          share,
          req,
          outcome: "denied",
          reason: "recipient_user_mismatch"
        });
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse({ message: API_MESSAGES.RECORDS.SHARE_RECIPIENT_MISMATCH }));
      }
    }

    if (share.recipientEmail) {
      const requestedEmail = String(req.query.email || req.user?.email || "").toLowerCase().trim();
      if (!requestedEmail || requestedEmail !== share.recipientEmail) {
        await auditShareAccess({
          share,
          req,
          outcome: "denied",
          reason: "recipient_email_mismatch"
        });
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse({ message: API_MESSAGES.RECORDS.SHARE_RECIPIENT_MISMATCH }));
      }
    }

    const record = await Record.findById(share.recordId);
    if (!record) {
      await auditShareAccess({
        share,
        req,
        outcome: "denied",
        reason: "record_not_found"
      });
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(errorResponse({ message: API_MESSAGES.RECORDS.RECORD_NOT_FOUND }));
    }

    let sharedFileUrl = null;
    let sharedFileUrlExpiresAt = null;
    if (record.cloudinaryPublicId && cloudinaryEnabled) {
      const signed = createSignedCloudinaryUrl({
        publicId: record.cloudinaryPublicId,
        resourceType: record.fileResourceType || "auto",
        expiresInSeconds: 180,
        asAttachment: false
      });
      sharedFileUrl = signed.signedUrl;
      sharedFileUrlExpiresAt = signed.expiresAt;
    }

    share.usedCount += 1;
    share.lastUsedAt = new Date();
    await share.save();

    await auditShareAccess({
      share,
      req,
      outcome: "success",
      reason: "granted"
    });

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: API_MESSAGES.RECORDS.SHARED_RECORD_FETCHED,
        data: {
          share: {
            id: share._id,
            expiresAt: share.expiresAt,
            remainingUses: Math.max(share.maxUses - share.usedCount, 0),
            oneTimeUse: share.maxUses === 1
          },
          record: {
            id: record._id,
            type: record.type,
            description: record.description,
            hospitalName: record.hospitalName,
            recordDate: record.recordDate,
            status: record.status,
            fileMimeType: record.fileMimeType,
            fileSize: record.fileSize,
            fileUrl: sharedFileUrl,
            fileUrlExpiresAt: sharedFileUrlExpiresAt
          }
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const revokeRecordShareLink = async (req, res, next) => {
  try {
    const { shareId } = req.params;

    const share = await RecordShareToken.findById(shareId).select(
      "recordId createdBy revokedAt"
    );
    if (!share) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(errorResponse({ message: API_MESSAGES.RECORDS.SHARE_TOKEN_INVALID_OR_EXPIRED }));
    }

    if (share.revokedAt) {
      return res.status(StatusCodes.OK).json(
        successResponse({
          message: API_MESSAGES.RECORDS.SHARE_LINK_REVOKED,
          data: {
            shareId: share._id,
            revokedAt: share.revokedAt
          }
        })
      );
    }

    const record = await Record.findById(share.recordId).select("patientId hospitalId");
    if (!record) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(errorResponse({ message: API_MESSAGES.RECORDS.RECORD_NOT_FOUND }));
    }

    const canManage = req.user.role === "admin"
      || String(share.createdBy) === String(req.user.id)
      || String(record.patientId) === String(req.user.id)
      || String(record.hospitalId) === String(req.user.id);

    if (!canManage) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(errorResponse({ message: API_MESSAGES.COMMON.ACCESS_DENIED }));
    }

    share.revokedAt = new Date();
    share.revokedBy = req.user.id;
    await share.save();

    await logSecurityAudit({
      req,
      userId: req.user.id,
      role: req.user.role,
      action: "share_revoked",
      resourceId: share.recordId,
      metadata: {
        shareId: share._id,
        recordId: share.recordId
      }
    });

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: API_MESSAGES.RECORDS.SHARE_LINK_REVOKED,
        data: {
          shareId: share._id,
          revokedAt: share.revokedAt
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
  adminBulkRecordAction,
  createRecordShareLink,
  getSharedRecordByToken,
  revokeRecordShareLink
};
