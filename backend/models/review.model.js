const mongoose = require("mongoose");

const REVIEW_ROLES = ["patient", "hospital"];
const REVIEW_TARGETS = ["hospital", "platform"];
const REVIEW_STATUSES = ["pending", "approved", "rejected"];

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    role: {
      type: String,
      enum: REVIEW_ROLES,
      required: true,
      index: true
    },
    target: {
      type: String,
      enum: REVIEW_TARGETS,
      required: true,
      index: true
    },
    targetHospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },
    targetHospitalName: {
      type: String,
      default: null,
      trim: true,
      maxlength: 180
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      index: true
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 1200
    },
    status: {
      type: String,
      enum: REVIEW_STATUSES,
      default: "pending",
      index: true
    },
    moderationNote: {
      type: String,
      default: null,
      trim: true,
      maxlength: 300
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    moderatedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }
  }
);

reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, createdAt: -1 });

const Review = mongoose.model("Review", reviewSchema);

module.exports = {
  Review,
  REVIEW_ROLES,
  REVIEW_TARGETS,
  REVIEW_STATUSES
};
