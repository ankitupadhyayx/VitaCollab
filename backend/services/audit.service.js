const { AuditLog } = require("../models");
const logger = require("../utils/logger");

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
    performedBy,
    action,
    actionType,
    targetType,
    targetId: targetId ? String(targetId) : null,
    metadata: metadata || null,
    timestamp: new Date()
  });
};

module.exports = {
  logAdminAudit
};
