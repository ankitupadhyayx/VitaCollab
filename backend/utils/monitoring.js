const logger = require("./logger");

const captureException = (error, context = {}) => {
  logger.error("Monitoring exception", {
    message: error?.message,
    stack: error?.stack,
    ...context
  });

  if (global.__SENTRY__) {
    global.__SENTRY__.captureException(error, { extra: context });
  }
};

module.exports = {
  captureException
};
