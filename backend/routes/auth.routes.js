const express = require("express");
const {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getCurrentUser
} = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");
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
router.post("/login", validate(loginSchema), login);
router.get("/verify-email", verifyEmail);
router.post("/forgot-password", validate(emailOnlySchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.post("/refresh", validate(refreshSchema), refresh);
router.post("/logout", validate(refreshSchema), logout);
router.get("/me", authenticate, getCurrentUser);

module.exports = router;
