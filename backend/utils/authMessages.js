const AUTH_MESSAGES = {
  AUTH_VALIDATION_FAILED: "Please check the highlighted fields and try again.",
  EMAIL_REQUIRED: "Please enter your email address.",
  INVALID_EMAIL: "Please enter a valid email address.",
  PROFILE_IMAGE_REQUIRED: "Profile image is required",
  ADMIN_PUBLIC_REGISTRATION_BLOCKED: "Admin registration is not allowed publicly",
  EMAIL_ALREADY_REGISTERED: "Email is already registered",
  SIGNUP_SUCCESS: "Your account has been created. Please check your email to verify it.",
  SIGNUP_NAME_REQUIRED: "Please enter your full name.",
  PASSWORD_MIN_LENGTH: "Please use at least 8 characters for your password.",
  PASSWORD_TOO_LONG: "Password is too long.",
  PHONE_REQUIRED_PATIENT: "Please enter your phone number.",
  PHONE_REQUIRED_HOSPITAL: "Please enter your hospital contact number.",
  AGE_REQUIRED_PATIENT: "Please enter your age.",
  GENDER_REQUIRED_PATIENT: "Please select your gender.",
  BLOOD_GROUP_REQUIRED_PATIENT: "Please select your blood group.",
  HOSPITAL_NAME_REQUIRED: "Please enter your hospital name.",
  LICENSE_NUMBER_REQUIRED: "Please enter your license number.",
  SPECIALIZATION_REQUIRED: "Please enter your specialization.",
  ADDRESS_REQUIRED: "Please enter your address.",

  VERIFY_TOKEN_REQUIRED: "Verification token is required.",
  VERIFY_INVALID_OR_EXPIRED: "Your verification link is invalid or expired.",
  VERIFY_SUCCESS: "Your email has been verified successfully.",
  VERIFY_FAILED: "We couldn't verify your email. Please try again.",

  RESEND_VERIFICATION_SUCCESS: "If an account exists, we sent a verification email.",
  RESEND_VERIFICATION_FAILED: "We couldn't send the verification email. Please try again.",
  ACCOUNT_ALREADY_VERIFIED: "Your account is already verified.",

  INVALID_CREDENTIALS: "Invalid email or password.",
  EMAIL_VERIFICATION_REQUIRED: "Please verify your email address to continue.",
  ACCOUNT_BLOCKED: "Your account has been blocked. Please contact support.",
  ACCOUNT_SUSPENDED: "Your account is currently suspended.",
  LOGIN_SUCCESS: "Signed in successfully.",
  LOGIN_EMAIL_REQUIRED: "Please enter your email address.",
  LOGIN_PASSWORD_REQUIRED: "Please enter your password.",

  REFRESH_TOKEN_REQUIRED: "Refresh token is required.",
  REFRESH_TOKEN_INVALID_OR_EXPIRED: "Invalid or expired refresh token.",
  REFRESH_SESSION_INVALID: "Invalid refresh session.",
  REFRESH_TOKEN_MISMATCH: "Refresh token mismatch.",
  TOKEN_REFRESHED: "Token refreshed.",

  LOGOUT_SUCCESS: "Signed out successfully.",

  FORGOT_PASSWORD_SUCCESS: "If an account exists, we sent a password reset link.",
  FORGOT_PASSWORD_FAILED: "We couldn't process your request. Please try again.",
  RESET_TOKEN_REQUIRED: "Reset token is required.",
  RESET_TOKEN_INVALID_OR_EXPIRED: "Your reset link is invalid or expired. Please request a new one.",
  RESET_PASSWORD_REQUIRED: "Please enter your new password.",
  RESET_PASSWORD_SUCCESS: "Your password has been reset successfully. You can now sign in.",

  USER_NOT_FOUND: "User not found",
  CURRENT_USER_FETCHED: "Current user fetched"
};

module.exports = {
  AUTH_MESSAGES
};
