const { AuditLog } = require("../models");
const logger = require("../utils/logger");

const getClientIp = (req) => {
  const forwardedFor = req?.headers?.["x-forwarded-for"];
  if (forwardedFor) {
    return String(forwardedFor).split(",")[0].trim();
  }

  const realIp = req?.headers?.["x-real-ip"];
  if (realIp) {
    return String(realIp).trim();
  }

  return req?.ip || req?.socket?.remoteAddress || null;
};

const getUserAgent = (req) => {
  const userAgent = req?.headers?.["user-agent"];
  return userAgent ? String(userAgent).slice(0, 1200) : null;
};

const normalizeObjectIdString = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value.toString === "function") {
    return value.toString();
  }

  return null;
};

const auditLogAsync = (entry) => {
  setImmediate(async () => {
    try {
      await AuditLog.create(entry);
    } catch (error) {
      logger.error("Failed to persist audit log", {
        message: error?.message,
        actionType: entry?.actionType,
        targetType: entry?.targetType,
        targetId: entry?.targetId
      });
    }
  });
};

const logAdminAudit = ({
  action,
  actionType,
  performedBy,
  targetType,
  targetId,
  metadata
}) => {
  auditLogAsync({
    userId: performedBy,
    role: "admin",
    performedBy,
    action,
    resourceId: targetId ? String(targetId) : null,
    ipAddress: null,
    userAgent: null,
    device: null,
    actionType,
    targetType,
    targetId: targetId ? String(targetId) : null,
    metadata: metadata || null,
    timestamp: new Date()
  });
};

const logSecurityAudit = async ({
  req,
  userId,
  role,
  action,
  resourceId = null,
  metadata = null,
  actionType = null,
  targetType = null,
  targetId = null,
  performedBy = null
}) => {
  const normalizedUserId = normalizeObjectIdString(userId || req?.user?.id);
  const normalizedPerformedBy = normalizeObjectIdString(performedBy || req?.user?.id || userId);

  await AuditLog.create({
    userId: normalizedUserId,
    role: role || req?.user?.role || "anonymous",
    performedBy: normalizedPerformedBy,
    action,
    resourceId: resourceId ? String(resourceId) : null,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
    device: getUserAgent(req),
    actionType,
    targetType,
    targetId: targetId ? String(targetId) : null,
    metadata: metadata || null,
    timestamp: new Date()
  });
};

module.exports = {
  logAdminAudit,
  logSecurityAudit
};
