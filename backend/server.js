const express = require("express");
const path = require("path");
const http = require("http");
const app = require("./app");
const env = require("./utils/env");
const connectDb = require("./config/db");
const logger = require("./utils/logger");
const { ensureDefaultAdmin } = require("./utils/seedAdmin");
const { getRefreshCookieOptions } = require("./utils/authCookies");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const warnOnCookieConfigMismatch = () => {
  const options = getRefreshCookieOptions();
  const sameSite = String(options.sameSite || "").toLowerCase();
  const secure = options.secure === true;
  logger.info("Effective backend auth/cors settings", {
    nodeEnv: env.nodeEnv,
    corsOrigins: env.corsOrigins,
    refreshCookieName: env.refreshCookieName,
    sameSite,
    secure,
    domain: options.domain || "<not-set>",
    path: options.path || "/"
  });

  if (env.nodeEnv !== "production") {
    return;
  }

  logger.info("Effective refresh cookie settings", {
    sameSite,
    secure,
    domain: options.domain || "<not-set>",
    path: options.path || "/"
  });

  if (sameSite === "none" && !secure) {
    logger.warn("Refresh cookie config is incompatible: SameSite=None requires Secure=true", {
      refreshCookieSameSite: sameSite,
      refreshCookieSecure: secure,
      hint: "Set REFRESH_COOKIE_SECURE=true in production"
    });
  }

  if (sameSite !== "none") {
    logger.warn("Refresh cookie may fail for cross-site frontend/backend deployments", {
      refreshCookieSameSite: sameSite,
      hint: "For cross-site deployments, set REFRESH_COOKIE_SAMESITE=none and REFRESH_COOKIE_SECURE=true"
    });
  }

  if (!env.refreshCookieDomain) {
    logger.warn("REFRESH_COOKIE_DOMAIN is not set", {
      hint: "Set REFRESH_COOKIE_DOMAIN for cross-subdomain setups if refresh cookie is not being sent"
    });
  }
};

const startServer = async () => {
  await connectDb(env.mongodbUri);
  await ensureDefaultAdmin();
  warnOnCookieConfigMismatch();

  if (env.enableWebsocket) {
    logger.warn("ENABLE_WEBSOCKET is true but backend WebSocket server is disabled in this build", {
      hint: "Set ENABLE_WEBSOCKET=false to silence this warning"
    });
  }

  const server = http.createServer(app);

  server.listen(env.port, () => {
    logger.info(`VitaCollab backend running on port ${env.port}`);
  });
};

startServer();
