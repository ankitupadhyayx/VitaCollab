const mongoose = require("mongoose");
const { ADMIN_ROLES } = require("../constants/admin-rbac");

const USER_ROLES = ["patient", "hospital", "admin"];
const ACCOUNT_STATUSES = ["active", "suspended", "blocked"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const patientProfileSchema = new mongoose.Schema(
  {
    age: { type: Number, min: 0, max: 140 },
    gender: { type: String, enum: ["male", "female", "other"] },
    bloodGroup: { type: String, enum: BLOOD_GROUPS },
    phone: { type: String, trim: true, maxlength: 20 },
    address: { type: String, trim: true, maxlength: 260 },
    emergencyContact: { type: String, trim: true, maxlength: 40 },
    dob: { type: Date, default: null },
    allergies: [{ type: String, trim: true, maxlength: 80 }],
    medicalConditions: [{ type: String, trim: true, maxlength: 120 }],
    medications: [{ type: String, trim: true, maxlength: 120 }]
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
    adminRole: {
      type: String,
      enum: ADMIN_ROLES,
      default: null,
      index: true
    },
    accountStatus: {
      type: String,
      enum: ACCOUNT_STATUSES,
      default: "active",
      index: true
    },
    statusReason: {
      type: String,
      default: null,
      maxlength: 300,
      trim: true
    },
    suspendedUntil: {
      type: Date,
      default: null
    },
    lastLoginAt: {
      type: Date,
      default: null,
      index: true
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
    isHospitalVerified: {
      type: Boolean,
      default: false,
      index: true
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
    },
    riskMetadata: {
      score: { type: Number, default: 0, min: 0, max: 100 },
      level: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], default: "LOW" },
      failedLoginCount: { type: Number, default: 0, min: 0 },
      deleteActionCount: { type: Number, default: 0, min: 0 },
      rateLimitHits: { type: Number, default: 0, min: 0 },
      lastEvaluatedAt: { type: Date, default: null }
    }
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }
  }
);

userSchema.pre("save", function normalizeAdminRole(next) {
  if (this.role === "admin" && !this.adminRole) {
    this.adminRole = "ADMIN";
  }

  if (this.role !== "admin") {
    this.adminRole = null;
  }

  next();
});

const User = mongoose.model("User", userSchema);

module.exports = {
  User,
  USER_ROLES,
  ACCOUNT_STATUSES,
  BLOOD_GROUPS
};
