const rateLimit = require("express-rate-limit");

const withRetryAfter = (message) => ({
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const resetAt = req.rateLimit?.resetTime ? new Date(req.rateLimit.resetTime).getTime() : 0;
    const retryAfterSeconds = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000) || 1);

    res.set("Retry-After", String(retryAfterSeconds));
    res.status(429).json({
      success: false,
      message
    });
  }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  ...withRetryAfter("Too many requests. Please try again later.")
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  ...withRetryAfter("Too many login attempts. Please try again later.")
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  ...withRetryAfter("Too many reset requests. Please try again later.")
});

const resendVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  ...withRetryAfter("Too many verification requests. Please try again later.")
});

const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 12,
  ...withRetryAfter("Too many password reset attempts. Please try again later.")
});

const reviewSubmitLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 6,
  ...withRetryAfter("Too many feedback submissions. Please try again later.")
});

module.exports = {
  apiLimiter,
  loginLimiter,
  forgotPasswordLimiter,
  resendVerificationLimiter,
  resetPasswordLimiter,
  reviewSubmitLimiter
};
