const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
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

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

module.exports = {
  AuditLog
};
