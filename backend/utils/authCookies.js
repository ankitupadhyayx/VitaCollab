const env = require("./env");

const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000
});

const getClearRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "strict"
});

module.exports = {
  getRefreshCookieOptions,
  getClearRefreshCookieOptions
};
