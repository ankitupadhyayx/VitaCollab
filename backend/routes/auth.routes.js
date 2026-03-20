const express = require("express");
const {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  getCurrentUser
} = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");
const {
  loginLimiter,
  forgotPasswordLimiter,
  resendVerificationLimiter,
  resetPasswordLimiter
} = require("../middleware/rateLimit.middleware");
const { validate } = require("../middleware/validate.middleware");
const { uploadProfileImage } = require("../middleware/profileUpload.middleware");
const {
  registerSchema,
  loginSchema,
  emailOnlySchema,
  resetPasswordSchema,
  refreshSchema
} = require("../utils/validators/auth.validator");

const router = express.Router();

router.post("/register", uploadProfileImage, validate(registerSchema), register);
router.post("/login", loginLimiter, validate(loginSchema), login);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationLimiter, validate(emailOnlySchema), resendVerification);
router.post("/forgot-password", forgotPasswordLimiter, validate(emailOnlySchema), forgotPassword);
router.post("/reset-password", resetPasswordLimiter, validate(resetPasswordSchema), resetPassword);
router.post("/refresh", validate(refreshSchema), refresh);
router.post("/logout", validate(refreshSchema), logout);
router.get("/me", authenticate, getCurrentUser);

module.exports = router;
