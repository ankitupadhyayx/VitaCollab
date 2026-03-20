const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const env = require("./env");

const buildJwtPayload = (user) => ({
  sub: user._id.toString(),
  role: user.role,
  email: user.email,
  verified: user.verified
});

const signAccessToken = (user) =>
  jwt.sign(buildJwtPayload(user), env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn
  });

const signRefreshToken = (user) =>
  jwt.sign(buildJwtPayload(user), env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn
  });

const signQrToken = (payload) =>
  jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: "5m"
  });

const verifyAccessToken = (token) => jwt.verify(token, env.jwtAccessSecret);
const verifyRefreshToken = (token) => jwt.verify(token, env.jwtRefreshSecret);
const verifyQrToken = (token) => jwt.verify(token, env.jwtAccessSecret);

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

module.exports = {
  signAccessToken,
  signRefreshToken,
  signQrToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyQrToken,
  hashToken
};
