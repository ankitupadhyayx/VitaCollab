const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");
const { StatusCodes } = require("http-status-codes");
const { User, AuditLog } = require("../models");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { hashPassword, comparePassword } = require("../utils/password");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken
} = require("../utils/authTokens");
const { createTokenWithHash } = require("../utils/cryptoTokens");
const { sendEmail } = require("../utils/mailer");
const { uploadBufferToCloudinary, cloudinaryEnabled } = require("../utils/cloudinary");
const env = require("../utils/env");
const logger = require("../utils/logger");
const { getRefreshCookieOptions, getClearRefreshCookieOptions } = require("../utils/authCookies");

const verificationTokenTtlMs = 60 * 60 * 1000;
const resetTokenTtlMs = 15 * 60 * 1000;
const resendVerificationCooldownMs = Number(process.env.RESEND_VERIFICATION_COOLDOWN_MS) || 60 * 1000;

const buildEmailShell = ({ heading, intro, buttonLabel, actionUrl, expiryNote }) => `
  <div style="margin:0;padding:0;background-color:#f4f6fb;font-family:Arial,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f6fb;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:28px 22px 14px 22px;">
                <h1 style="margin:0 0 12px 0;font-size:24px;line-height:1.3;color:#0f172a;">${heading}</h1>
                <p style="margin:0 0 18px 0;font-size:15px;line-height:1.6;color:#374151;">${intro}</p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 14px 0;">
                  <tr>
                    <td style="border-radius:10px;background:#0f766e;">
                      <a href="${actionUrl}" style="display:inline-block;padding:12px 18px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">${buttonLabel}</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 10px 0;font-size:14px;color:#6b7280;">If the button does not work, copy and paste this URL into your browser:</p>
                <p style="margin:0 0 10px 0;word-break:break-all;"><a href="${actionUrl}" style="font-size:13px;color:#0f766e;text-decoration:underline;">${actionUrl}</a></p>
                <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">${expiryNote}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
`;

const buildVerificationEmailHtml = (verifyUrl) =>
  buildEmailShell({
    heading: "Verify your VitaCollab account",
    intro: "Please confirm your email address to activate your account and continue securely.",
    buttonLabel: "Verify Email",
    actionUrl: verifyUrl,
    expiryNote: "This verification link expires in 1 hour."
  });

const buildResetPasswordEmailHtml = (resetUrl) =>
  buildEmailShell({
    heading: "Reset your password",
    intro: "We received a request to reset your password. Use the secure link below to continue.",
    buttonLabel: "Reset Password",
    actionUrl: resetUrl,
    expiryNote: "This reset link expires in 15 minutes."
  });

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  adminRole: user.adminRole || null,
  profileImageUrl: user.profileImageUrl,
  patientProfile: user.patientProfile,
  hospitalProfile: user.hospitalProfile,
  verified: user.verified,
  isVerified: user.isVerified,
  isHospitalVerified: user.isHospitalVerified,
  accountStatus: user.accountStatus,
  suspendedUntil: user.suspendedUntil,
  statusReason: user.statusReason,
  riskMetadata: user.riskMetadata || null,
  createdAt: user.createdAt
});

const buildAuthPayload = (user) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  return {
    accessToken,
    refreshToken,
    user: sanitizeUser(user)
  };
};

const setRefreshCookie = (res, refreshToken) => {
  res.cookie(env.refreshCookieName, refreshToken, getRefreshCookieOptions());
};

const uploadProfileImageLocally = async (req, role) => {
  const ext = path.extname(req.file.originalname || "").toLowerCase() || ".jpg";
  const safeRole = role === "hospital" ? "hospital" : "patient";
  const fileName = `${Date.now()}-${randomUUID()}${ext}`;
  const relativeDir = path.join("uploads", "profiles", safeRole);
  const absoluteDir = path.join(process.cwd(), relativeDir);
  const absolutePath = path.join(absoluteDir, fileName);

  await fs.mkdir(absoluteDir, { recursive: true });
  await fs.writeFile(absolutePath, req.file.buffer);

  return {
    url: `${req.protocol}://${req.get("host")}/${relativeDir.replace(/\\/g, "/")}/${fileName}`
  };
};

const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      age,
      gender,
      bloodGroup,
      phone,
      hospitalName,
      licenseNumber,
      specialization,
      address
    } = req.body;

    if (!req.file) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse({ message: "Profile image is required" }));
    }

    if (role === "admin") {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(errorResponse({ message: "Admin registration is not allowed publicly" }));
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res
        .status(StatusCodes.CONFLICT)
        .json(errorResponse({ message: "Email is already registered" }));
    }

    const { token, tokenHash } = createTokenWithHash();
    const passwordHash = await hashPassword(password);
    let profileImage;
    try {
      if (cloudinaryEnabled) {
        profileImage = await uploadBufferToCloudinary(
          req.file.buffer,
          `vitacollab/profiles/${role}`,
          "image"
        );
      } else {
        profileImage = await uploadProfileImageLocally(req, role);
      }
    } catch (uploadError) {
      if (env.nodeEnv === "development") {
        profileImage = await uploadProfileImageLocally(req, role);
      } else {
        throw uploadError;
      }
    }

    const profilePatch =
      role === "patient"
        ? {
            patientProfile: {
              age,
              gender,
              bloodGroup,
              phone
            }
          }
        : {
            hospitalProfile: {
              hospitalName,
              licenseNumber,
              specialization,
              address,
              phone,
              verifiedByAdmin: false
            }
          };

    const user = await User.create({
      name,
      email,
      password: passwordHash,
      role: role || "patient",
      profileImageUrl: profileImage.url,
      verified: false,
      isVerified: false,
      isHospitalVerified: false,
      verificationToken: tokenHash,
      verificationTokenExpiry: new Date(Date.now() + verificationTokenTtlMs),
      lastVerificationEmailSentAt: new Date(),
      ...profilePatch
    });

    const verifyUrl = `${env.clientUrl}/verify?token=${encodeURIComponent(token)}`;
    await sendEmail({
      to: user.email,
      subject: "Verify your VitaCollab account",
      html: buildVerificationEmailHtml(verifyUrl)
    });

    return res.status(StatusCodes.CREATED).json(
      successResponse({
        message: "Registration successful. Please verify your email.",
        data: {
          user: sanitizeUser(user),
          verificationPreviewToken: env.nodeEnv === "development" ? token : undefined
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse({ message: "Verification token is required" }));
    }

    const tokenHash = hashToken(token);

    const user = await User.findOne({
      verificationToken: tokenHash,
      verificationTokenExpiry: { $gt: new Date() }
    }).select("+verificationToken +verificationTokenExpiry");

    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse({ message: "Invalid or expired verification token" }));
    }

    user.verified = true;
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "Email verified successfully"
      })
    );
  } catch (error) {
    return next(error);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email }).select("+verificationToken +verificationTokenExpiry +lastVerificationEmailSentAt");
    if (!user) {
      return res.status(StatusCodes.OK).json(
        successResponse({
          message: "If that email exists, a verification link has been sent"
        })
      );
    }

    if (user.isVerified === true || user.verified === true) {
      return res.status(StatusCodes.OK).json(
        successResponse({
          message: "Account already verified"
        })
      );
    }

    if (user.lastVerificationEmailSentAt) {
      const elapsedMs = Date.now() - new Date(user.lastVerificationEmailSentAt).getTime();
      if (elapsedMs < resendVerificationCooldownMs) {
        const retryAfterSeconds = Math.ceil((resendVerificationCooldownMs - elapsedMs) / 1000);
        return res
          .status(StatusCodes.TOO_MANY_REQUESTS)
          .json(errorResponse({ message: `Please wait ${retryAfterSeconds}s before requesting another verification email` }));
      }
    }

    const { token, tokenHash } = createTokenWithHash();
    user.verificationToken = tokenHash;
    user.verificationTokenExpiry = new Date(Date.now() + verificationTokenTtlMs);
    user.lastVerificationEmailSentAt = new Date();
    await user.save();

    const verifyUrl = `${env.clientUrl}/verify?token=${encodeURIComponent(token)}`;
    await sendEmail({
      to: user.email,
      subject: "Verify your VitaCollab account",
      html: buildVerificationEmailHtml(verifyUrl)
    });

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "Verification email sent"
      })
    );
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password +refreshTokenHash");
    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(errorResponse({ message: "Invalid email or password" }));
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      user.riskMetadata = {
        ...(user.riskMetadata || {}),
        failedLoginCount: Number(user.riskMetadata?.failedLoginCount || 0) + 1,
        lastEvaluatedAt: new Date()
      };
      await user.save();
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(errorResponse({ message: "Invalid email or password" }));
    }

    const userVerified = user.isVerified === true || user.verified === true;

    if (!userVerified) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(errorResponse({ message: "Please verify your email" }));
    }

    if (user.accountStatus === "blocked") {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(errorResponse({ message: "Your account has been blocked by admin" }));
    }

    if (user.accountStatus === "suspended") {
      const suspensionExpired = user.suspendedUntil && new Date(user.suspendedUntil).getTime() <= Date.now();
      if (!suspensionExpired) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse({ message: "Your account is currently suspended" }));
      }

      user.accountStatus = "active";
      user.suspendedUntil = null;
      user.statusReason = null;
    }

    const { accessToken, refreshToken, user: safeUser } = buildAuthPayload(user);
    user.refreshTokenHash = hashToken(refreshToken);
    user.lastLoginAt = new Date();
    user.riskMetadata = {
      ...(user.riskMetadata || {}),
      failedLoginCount: 0,
      lastEvaluatedAt: new Date()
    };
    await user.save();

    await AuditLog.create({
      userId: user._id,
      action: "auth.login",
      metadata: {
        role: user.role
      }
    });

    setRefreshCookie(res, refreshToken);

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "Login successful",
        data: {
          accessToken,
          refreshToken,
          user: safeUser
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const providedToken = req.body.refreshToken || req.cookies?.[env.refreshCookieName];

    if (!providedToken) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(errorResponse({ message: "Refresh token is required" }));
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(providedToken);
    } catch (error) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(errorResponse({ message: "Invalid or expired refresh token" }));
    }

    const user = await User.findById(decoded.sub).select("+refreshTokenHash");
    if (!user || !user.refreshTokenHash) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(errorResponse({ message: "Invalid refresh session" }));
    }

    if (user.refreshTokenHash !== hashToken(providedToken)) {
      logger.warn("Refresh token mismatch detected", {
        userId: user._id.toString(),
        email: user.email
      });
      user.refreshTokenHash = null;
      await user.save();
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(errorResponse({ message: "Refresh token mismatch" }));
    }

    const { accessToken, refreshToken, user: safeUser } = buildAuthPayload(user);
    user.refreshTokenHash = hashToken(refreshToken);
    await user.save();

    setRefreshCookie(res, refreshToken);

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "Token refreshed",
        data: {
          accessToken,
          refreshToken,
          user: safeUser
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const providedToken = req.body.refreshToken || req.cookies?.[env.refreshCookieName];

    if (providedToken) {
      try {
        const decoded = verifyRefreshToken(providedToken);
        const user = await User.findById(decoded.sub).select("+refreshTokenHash");
        if (user) {
          user.refreshTokenHash = null;
          await user.save();

          await AuditLog.create({
            userId: user._id,
            action: "auth.logout",
            metadata: {
              role: user.role
            }
          });
        }
      } catch (error) {
        // Intentionally swallow token errors on logout to avoid leaking token state.
      }
    }

    res.clearCookie(env.refreshCookieName, getClearRefreshCookieOptions());

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "Logged out successfully"
      })
    );
  } catch (error) {
    return next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email }).select("+resetToken +resetTokenExpiry");
    if (!user) {
      return res.status(StatusCodes.OK).json(
        successResponse({
          message: "If that email exists, a reset link has been sent"
        })
      );
    }

    const { token, tokenHash } = createTokenWithHash();
    user.resetToken = tokenHash;
    user.resetTokenExpiry = new Date(Date.now() + resetTokenTtlMs);
    await user.save();

    const resetUrl = `${env.clientUrl}/reset-password?token=${encodeURIComponent(token)}`;
    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      html: buildResetPasswordEmailHtml(resetUrl)
    });

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "Password reset link sent"
      })
    );
  } catch (error) {
    return next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const tokenHash = hashToken(token);

    const user = await User.findOne({
      resetToken: tokenHash,
      resetTokenExpiry: { $gt: new Date() }
    }).select("+resetToken +resetTokenExpiry +password +refreshTokenHash");

    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse({ message: "Invalid or expired reset token" }));
    }

    user.password = await hashPassword(newPassword);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    user.refreshTokenHash = null;
    await user.save();

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "Password reset successful"
      })
    );
  } catch (error) {
    return next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(errorResponse({ message: "User not found" }));
    }

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "Current user fetched",
        data: {
          user: sanitizeUser(user)
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  getCurrentUser
};
