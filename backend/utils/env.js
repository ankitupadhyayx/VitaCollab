const dotenv = require("dotenv");

dotenv.config();

const normalizeUrl = (value, fallback) => {
  const raw = (value || fallback || "").trim();
  if (!raw) {
    return "";
  }

  const normalizedProtocol = raw.replace(/^(https?:)\/+/i, "$1//");
  return normalizedProtocol.replace(/\/+$/, "");
};

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
const jwtBaseSecret = process.env.JWT_SECRET;
const jwtAccessSecret = process.env.JWT_ACCESS_SECRET || jwtBaseSecret;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || jwtBaseSecret;

const requiredVars = [
  { name: "MONGO_URI or MONGODB_URI", value: mongoUri },
  { name: "JWT_SECRET or JWT_ACCESS_SECRET", value: jwtAccessSecret },
  { name: "JWT_SECRET or JWT_REFRESH_SECRET", value: jwtRefreshSecret },
  { name: "AES_SECRET_KEY", value: process.env.AES_SECRET_KEY }
];

requiredVars.forEach(({ name, value }) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
});

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongodbUri: mongoUri,
  clientUrl: normalizeUrl(
    process.env.CLIENT_URL || process.env.APP_URL,
    process.env.NODE_ENV === "production" ? "https://vitacollab.in" : "http://localhost:3000"
  ),
  appUrl: normalizeUrl(
    process.env.APP_URL || process.env.CLIENT_URL,
    process.env.NODE_ENV === "production" ? "https://vitacollab.in" : "http://localhost:3000"
  ),
  jwtAccessSecret,
  jwtRefreshSecret,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  refreshCookieName: process.env.REFRESH_COOKIE_NAME || "vc_refresh_token",
  aesSecretKey: process.env.AES_SECRET_KEY,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  defaultAdminEmail: process.env.DEFAULT_ADMIN_EMAIL,
  defaultAdminPassword: process.env.DEFAULT_ADMIN_PASSWORD,
  logLevel: process.env.LOG_LEVEL || "info"
};
