const path = require("path");
const { StatusCodes } = require("http-status-codes");
const { Record } = require("../models");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { cloudinaryEnabled, createSignedCloudinaryUrl } = require("../utils/cloudinary");
const { API_MESSAGES } = require("../utils/apiMessages");
const { canAccessRecord } = require("../services/recordAccess.service");
const { logSecurityAudit } = require("../services/audit.service");

const buildLegacyLocalFileLink = (recordId, asDownload) => {
  const suffix = asDownload ? "?download=true" : "";
  return `/api/v1/files/${recordId}/content${suffix}`;
};

const getRecordFileAccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    const asDownload = req.query.download === true;

    const record = await Record.findById(id).select(
      "patientId hospitalId cloudinaryPublicId fileResourceType filePath fileMimeType"
    );

    if (!record) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(errorResponse({ message: API_MESSAGES.RECORDS.RECORD_NOT_FOUND }));
    }

    const allowed = await canAccessRecord({ user: req.user, record });
    if (!allowed) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(errorResponse({ message: API_MESSAGES.RECORDS.RECORD_ACCESS_DENIED }));
    }

    const auditAction = asDownload ? "file_download" : "file_view";

    let fileUrl = null;
    let expiresAt = null;

    if (record.cloudinaryPublicId && cloudinaryEnabled) {
      const signed = createSignedCloudinaryUrl({
        publicId: record.cloudinaryPublicId,
        resourceType: record.fileResourceType || "auto",
        expiresInSeconds: asDownload ? 120 : 300,
        asAttachment: asDownload
      });
      fileUrl = signed.signedUrl;
      expiresAt = signed.expiresAt;
    } else if (record.filePath) {
      fileUrl = buildLegacyLocalFileLink(record._id.toString(), asDownload);
      expiresAt = new Date(Date.now() + 60 * 1000);
    }

    if (!fileUrl) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(errorResponse({ message: API_MESSAGES.RECORDS.FILE_UNAVAILABLE }));
    }

    await logSecurityAudit({
      req,
      userId: req.user.id,
      role: req.user.role,
      action: auditAction,
      resourceId: record._id,
      metadata: {
        recordId: record._id,
        patientId: record.patientId,
        hospitalId: record.hospitalId,
        action: auditAction
      }
    });

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: API_MESSAGES.RECORDS.FILE_ACCESS_GRANTED,
        data: {
          recordId: record._id,
          action: auditAction,
          fileUrl,
          expiresAt
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const serveLegacyLocalFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const asDownload = req.query.download === true;

    const record = await Record.findById(id).select(
      "patientId hospitalId filePath fileMimeType"
    );

    if (!record || !record.filePath) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(errorResponse({ message: API_MESSAGES.RECORDS.FILE_UNAVAILABLE }));
    }

    const allowed = await canAccessRecord({ user: req.user, record });
    if (!allowed) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(errorResponse({ message: API_MESSAGES.RECORDS.RECORD_ACCESS_DENIED }));
    }

    const absolutePath = path.resolve(record.filePath);
    if (asDownload) {
      res.setHeader("Content-Disposition", `attachment; filename=record-${record._id}`);
    }
    if (record.fileMimeType) {
      res.type(record.fileMimeType);
    }

    await logSecurityAudit({
      req,
      userId: req.user.id,
      role: req.user.role,
      action: asDownload ? "file_download" : "file_view",
      resourceId: record._id,
      metadata: {
        recordId: record._id,
        patientId: record.patientId,
        hospitalId: record.hospitalId,
        action: asDownload ? "file_download" : "file_view"
      }
    });

    return res.sendFile(absolutePath);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getRecordFileAccess,
  serveLegacyLocalFile
};
