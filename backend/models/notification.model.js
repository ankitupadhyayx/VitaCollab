const mongoose = require("mongoose");

const NOTIFICATION_TYPES = ["approval_request", "record_approved", "record_rejected", "reminder", "system"];

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 600
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      default: "system"
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }
  }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = {
  Notification,
  NOTIFICATION_TYPES
};
