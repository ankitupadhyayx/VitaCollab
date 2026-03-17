const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");
const { StatusCodes } = require("http-status-codes");
const { User } = require("../models");
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
const { getRefreshCookieOptions, getClearRefreshCookieOptions } = require("../utils/authCookies");

const verificationTokenTtlMs = 24 * 60 * 60 * 1000;
const resetTokenTtlMs = 30 * 60 * 1000;

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  profileImageUrl: user.profileImageUrl,
  patientProfile: user.patientProfile,
  hospitalProfile: user.hospitalProfile,
  verified: user.verified,
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
      verificationTokenHash: tokenHash,
      verificationTokenExpiry: new Date(Date.now() + verificationTokenTtlMs),
      ...profilePatch
    });

    const verifyUrl = `${env.appUrl}/verify-email?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: "Verify your VitaCollab account",
      html: `<p>Click this link to verify your account:</p><p>${verifyUrl}</p>`
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
      verificationTokenHash: tokenHash,
      verificationTokenExpiry: { $gt: new Date() }
    }).select("+verificationTokenHash +verificationTokenExpiry");

    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse({ message: "Invalid or expired verification token" }));
    }

    user.verified = true;
    user.verificationTokenHash = null;
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
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(errorResponse({ message: "Invalid email or password" }));
    }

    if (!user.verified) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(errorResponse({ message: "Please verify your email before login" }));
    }

    const { accessToken, refreshToken, user: safeUser } = buildAuthPayload(user);
    user.refreshTokenHash = hashToken(refreshToken);
    await user.save();

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

    const user = await User.findOne({ email }).select("+resetPasswordTokenHash +resetPasswordTokenExpiry");
    if (!user) {
      return res.status(StatusCodes.OK).json(
        successResponse({
          message: "If that email exists, a reset link has been sent"
        })
      );
    }

    const { token, tokenHash } = createTokenWithHash();
    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordTokenExpiry = new Date(Date.now() + resetTokenTtlMs);
    await user.save();

    const resetUrl = `${env.appUrl}/reset-password?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: "Reset your VitaCollab password",
      html: `<p>Use this link to reset your password:</p><p>${resetUrl}</p>`
    });

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "If that email exists, a reset link has been sent",
        data: {
          resetPreviewToken: env.nodeEnv === "development" ? token : undefined
        }
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
      resetPasswordTokenHash: tokenHash,
      resetPasswordTokenExpiry: { $gt: new Date() }
    }).select("+resetPasswordTokenHash +resetPasswordTokenExpiry +password +refreshTokenHash");

    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse({ message: "Invalid or expired reset token" }));
    }

    user.password = await hashPassword(newPassword);
    user.resetPasswordTokenHash = null;
    user.resetPasswordTokenExpiry = null;
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
  getCurrentUser
};
