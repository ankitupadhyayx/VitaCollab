const mongoose = require("mongoose");
const { ACTION_TYPES, TARGET_TYPES } = require("../constants/admin-rbac");

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true
    },
    role: {
      type: String,
      enum: ["patient", "hospital", "admin", "anonymous"],
      default: "anonymous",
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
    resourceId: {
      type: String,
      default: null,
      trim: true,
      index: true
    },
    ipAddress: {
      type: String,
      default: null,
      trim: true,
      maxlength: 128
    },
    userAgent: {
      type: String,
      default: null,
      trim: true,
      maxlength: 1200
    },
    device: {
      type: String,
      default: null,
      trim: true,
      maxlength: 1200
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
auditLogSchema.index({ action: 1, resourceId: 1, timestamp: -1 });

const immutableError = () => new Error("Audit logs are immutable and cannot be modified or deleted.");

auditLogSchema.pre("updateOne", function(next) {
  next(immutableError());
});

auditLogSchema.pre("updateMany", function(next) {
  next(immutableError());
});

auditLogSchema.pre("findOneAndUpdate", function(next) {
  next(immutableError());
});

auditLogSchema.pre("replaceOne", function(next) {
  next(immutableError());
});

auditLogSchema.pre("findOneAndDelete", function(next) {
  next(immutableError());
});

auditLogSchema.pre("deleteOne", function(next) {
  next(immutableError());
});

auditLogSchema.pre("deleteMany", function(next) {
  next(immutableError());
});

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

module.exports = {
  AuditLog
};
