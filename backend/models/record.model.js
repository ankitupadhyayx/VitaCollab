const mongoose = require("mongoose");

const RECORD_TYPES = ["prescription", "report", "bill", "diagnosis", "lab", "other"];
const RECORD_STATUS = ["pending", "approved", "rejected"];

const recordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: RECORD_TYPES,
      required: true
    },
    hospitalName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    fileUrl: {
      type: String,
      required: true
    },
    // Legacy local-storage path retained for backward compatibility during migration.
    filePath: {
      type: String,
      default: null
    },
    cloudinaryPublicId: {
      type: String,
      required: true
    },
    fileResourceType: {
      type: String,
      default: "auto"
    },
    fileMimeType: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: RECORD_STATUS,
      default: "pending",
      index: true
    },
    encryptedRejectionReason: {
      type: String,
      default: null,
      select: false
    },
    recordDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    approvedAt: {
      type: Date,
      default: null
    },
    rejectedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }
  }
);

recordSchema.index({ patientId: 1, status: 1, recordDate: -1 });
recordSchema.index({ hospitalId: 1, createdAt: -1 });

const Record = mongoose.model("Record", recordSchema);

module.exports = {
  Record,
  RECORD_TYPES,
  RECORD_STATUS
};
