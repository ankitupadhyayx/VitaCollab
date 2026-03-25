const env = require("./env");

const resolveSameSite = () => {
  const candidate = String(env.refreshCookieSameSite || "").toLowerCase();
  if (["lax", "strict", "none"].includes(candidate)) {
    return candidate;
  }
  return "none";
};

const resolveSecure = (sameSite) => {
  if (typeof env.refreshCookieSecure === "boolean") {
    if (sameSite === "none" && env.refreshCookieSecure !== true) {
      return true;
    }
    return env.refreshCookieSecure;
  }

  return sameSite === "none" ? true : env.isProd;
};

const buildCookieBaseOptions = () => {
  const sameSite = resolveSameSite();
  const secure = resolveSecure(sameSite);

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
