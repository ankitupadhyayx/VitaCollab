const levels = {
  info: 0,
  warn: 1,
  error: 2
};

const currentLevelName = process.env.LOG_LEVEL || "info";
const currentLevel = levels[currentLevelName] ?? levels.info;

const shouldLog = (levelName) => levels[levelName] >= currentLevel;

const formatMessage = (levelName, message, meta) => {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${levelName.toUpperCase()}] ${message}`;
  if (!meta) {
    return base;
  }
  return `${base} ${JSON.stringify(meta)}`;
};

const logger = {
  info: (message, meta) => {
    if (shouldLog("info")) {
      console.log(formatMessage("info", message, meta));
    }
  },
  warn: (message, meta) => {
    if (shouldLog("warn")) {
      console.warn(formatMessage("warn", message, meta));
    }
  },
  error: (message, meta) => {
    if (shouldLog("error")) {
      console.error(formatMessage("error", message, meta));
    }
  }
};

module.exports = logger;
