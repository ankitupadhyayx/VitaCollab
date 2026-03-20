const mongoose = require("mongoose");
const { ACTION_TYPES, TARGET_TYPES } = require("../constants/admin-rbac");

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null
    },
    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
    },
    actionType: {
      type: String,
      enum: ACTION_TYPES,
      default: null,
      index: true
    },
    targetType: {
      type: String,
      enum: TARGET_TYPES,
      default: null,
      index: true
    },
    targetId: {
      type: String,
      default: null,
      trim: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false
  }
);

auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ actionType: 1, timestamp: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1, timestamp: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

module.exports = {
  AuditLog
};
