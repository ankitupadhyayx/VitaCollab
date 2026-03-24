const mongoose = require("mongoose");

const recordShareTokenSchema = new mongoose.Schema(
  {
    recordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Record",
      required: true,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    maxUses: {
      type: Number,
      default: 1,
      min: 1,
      max: 20
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0
    },
    lastUsedAt: {
      type: Date,
      default: null
    },
    recipientEmail: {
      type: String,
      default: null,
      lowercase: true,
      trim: true
    },
    recipientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },
    revokedAt: {
      type: Date,
      default: null,
      index: true
    },
    revokedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }
  }
);

recordShareTokenSchema.index({ recordId: 1, createdBy: 1, createdAt: -1 });
recordShareTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RecordShareToken = mongoose.model("RecordShareToken", recordShareTokenSchema);

module.exports = {
  RecordShareToken
};
