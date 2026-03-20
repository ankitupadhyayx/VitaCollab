const mongoose = require("mongoose");

const USER_ROLES = ["patient", "hospital", "admin"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const patientProfileSchema = new mongoose.Schema(
  {
    age: { type: Number, min: 0, max: 140 },
    gender: { type: String, enum: ["male", "female", "other"] },
    bloodGroup: { type: String, enum: BLOOD_GROUPS },
    phone: { type: String, trim: true, maxlength: 20 }
  },
  { _id: false }
);

const hospitalProfileSchema = new mongoose.Schema(
  {
    hospitalName: { type: String, trim: true, maxlength: 180 },
    licenseNumber: { type: String, trim: true, maxlength: 80 },
    specialization: { type: String, trim: true, maxlength: 160 },
    address: { type: String, trim: true, maxlength: 260 },
    phone: { type: String, trim: true, maxlength: 20 },
    verifiedByAdmin: { type: Boolean, default: false }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "patient"
    },
    profileImageUrl: {
      type: String,
      required: true,
      trim: true
    },
    verified: {
      type: Boolean,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    patientProfile: {
      type: patientProfileSchema,
      default: undefined
    },
    hospitalProfile: {
      type: hospitalProfileSchema,
      default: undefined
    },
    verificationToken: {
      type: String,
      default: null,
      select: false
    },
    verificationTokenExpiry: {
      type: Date,
      default: null,
      select: false
    },
    lastVerificationEmailSentAt: {
      type: Date,
      default: null,
      select: false
    },
    resetToken: {
      type: String,
      default: null,
      select: false
    },
    resetTokenExpiry: {
      type: Date,
      default: null,
      select: false
    },
    resetPasswordTokenHash: {
      type: String,
      default: null,
      select: false
    },
    resetPasswordTokenExpiry: {
      type: Date,
      default: null,
      select: false
    },
    refreshTokenHash: {
      type: String,
      default: null,
      select: false
    }
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }
  }
);

const User = mongoose.model("User", userSchema);

module.exports = {
  User,
  USER_ROLES,
  BLOOD_GROUPS
};
