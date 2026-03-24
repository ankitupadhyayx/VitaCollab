const morgan = require("morgan");
const logger = require("../utils/logger");

const redactSensitiveUrlSegments = (url = "") => {
  return String(url)
    .replace(/(\/api\/v1\/share\/)[^/?\s]+/gi, "$1[REDACTED]")
    .replace(/(\/api\/v1\/records\/shared\/)[^/?\s]+/gi, "$1[REDACTED]")
    .replace(/([?&](?:token|shareToken)=)[^&\s]+/gi, "$1[REDACTED]");
};

morgan.token("safe-url", (req) => redactSensitiveUrlSegments(req.originalUrl || req.url || ""));

const requestLogger = morgan(':remote-addr - :remote-user [:date[clf]] ":method :safe-url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
});

module.exports = {
  requestLogger
};
