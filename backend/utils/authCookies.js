const env = require("./env");

const buildCookieBaseOptions = () => {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    ...(env.refreshCookieDomain ? { domain: env.refreshCookieDomain } : {})
  };
};

const getRefreshCookieOptions = () => ({
  ...buildCookieBaseOptions(),
  maxAge: 7 * 24 * 60 * 60 * 1000
});

const getClearRefreshCookieOptions = () => ({
  ...buildCookieBaseOptions()
});

module.exports = {
  getRefreshCookieOptions,
  getClearRefreshCookieOptions
};
