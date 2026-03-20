const format = (level, message, meta) => {
  const base = `[frontend:${level}] ${message}`;
  if (!meta) {
    return base;
  }
  return `${base} ${JSON.stringify(meta)}`;
};

export const logger = {
  info: (message, meta) => {
    console.info(format("info", message, meta));
  },
  warn: (message, meta) => {
    console.warn(format("warn", message, meta));
  },
  error: (message, meta) => {
    console.error(format("error", message, meta));
  },
  captureException: (error, context = {}) => {
    console.error(format("exception", error?.message || "Unknown error", context));
    if (typeof window !== "undefined" && window.__SENTRY__) {
      window.__SENTRY__.captureException(error, { extra: context });
    }
  }
};
