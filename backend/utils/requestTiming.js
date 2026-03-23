const logger = require("./logger");

const nowMs = () => Number(process.hrtime.bigint()) / 1e6;

const withRequestTiming = async ({ req, label, meta = {} }, operation) => {
  const start = nowMs();

  try {
    return await operation();
  } finally {
    const durationMs = Math.round((nowMs() - start) * 100) / 100;
    logger.info("api.request_timing", {
      label,
      method: req.method,
      path: req.originalUrl,
      userId: req.user?.id,
      role: req.user?.role,
      durationMs,
      ...meta
    });
  }
};

module.exports = {
  withRequestTiming
};
