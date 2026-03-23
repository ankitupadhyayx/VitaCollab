export const AUTH_COPY = {
  INVALID_EMAIL: "Please enter a valid email address.",
  PASSWORD_REQUIRED: "Please enter your password.",
  LOGIN_FAILED: "We couldn't sign you in. Please try again.",
  SIGNUP_ROLE_REQUIRED: "Please select a role to continue.",
  SIGNUP_NAME_REQUIRED: "Please enter your full name.",
  SIGNUP_PASSWORD_WEAK: "Please use a stronger password with uppercase letters, numbers, and symbols.",
  SIGNUP_TERMS_REQUIRED: "Please accept the terms and privacy policy to continue.",
  SIGNUP_SUCCESS: "Your account has been created. Please check your email to verify it.",
  SIGNUP_FAILED: "We couldn't create your account. Please try again.",
  RESEND_VERIFICATION_SUCCESS: "If an account exists, we sent a verification email.",
  RESEND_VERIFICATION_FAILED: "We couldn't send the verification email. Please try again.",
  EMAIL_REQUIRED: "Please enter your email address.",
  VERIFY_TOKEN_REQUIRED: "Verification token is required.",
  VERIFY_INVALID_OR_EXPIRED: "Your verification link is invalid or expired.",
  VERIFY_SUCCESS: "Your email has been verified successfully.",
  VERIFY_FAILED: "We couldn't verify your email. Please try again.",
  FORGOT_PASSWORD_SUCCESS: "If an account exists, we sent a password reset link.",
  FORGOT_PASSWORD_FAILED: "We couldn't process your request. Please try again.",
  RESET_TOKEN_REQUIRED: "Please enter your reset token.",
  RESET_PASSWORD_MIN_LENGTH: "Please use at least 8 characters for your new password.",
  RESET_PASSWORD_SUCCESS: "Your password has been reset successfully. You can now sign in.",
  RESET_PASSWORD_FAILED: "We couldn't reset your password. Please try again.",
  TOKEN_INVALID_OR_EXPIRED: "Your reset link is invalid or expired. Please request a new one."
};

export const normalizeAuthErrorMessage = (message, fallback) => {
  const normalized = String(message || "").toLowerCase();

  if (!normalized) {
    return fallback;
  }

  if (normalized.includes("invalid") && normalized.includes("token")) {
    return AUTH_COPY.TOKEN_INVALID_OR_EXPIRED;
  }

  if (normalized.includes("invalid") && normalized.includes("verification")) {
    return AUTH_COPY.VERIFY_INVALID_OR_EXPIRED;
  }

  if (normalized.includes("expired")) {
    return AUTH_COPY.TOKEN_INVALID_OR_EXPIRED;
  }

  if (normalized.includes("verify") && normalized.includes("email")) {
    return AUTH_COPY.VERIFY_FAILED;
  }

  if (normalized.includes("email") && normalized.includes("required")) {
    return AUTH_COPY.EMAIL_REQUIRED;
  }

  return message;
};
