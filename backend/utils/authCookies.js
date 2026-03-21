const env = require("./env");

const normalizeSameSite = (value) => {
  const candidate = String(value || "").toLowerCase();
  if (["lax", "strict", "none"].includes(candidate)) {
    return candidate;
  }
  return "lax";
};

const buildCookieBaseOptions = () => {
  const sameSite = normalizeSameSite(env.refreshCookieSameSite);
  const secure =
    typeof env.refreshCookieSecure === "boolean"
      ? env.refreshCookieSecure
      : sameSite === "none"
        ? true
        : env.nodeEnv === "production";

  return {
    httpOnly: true,
    secure,
    sameSite,
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
