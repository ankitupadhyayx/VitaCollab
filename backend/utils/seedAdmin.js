const { User } = require("../models");
const { hashPassword } = require("./password");
const env = require("./env");
const logger = require("./logger");

const ensureDefaultAdmin = async () => {
  if (!env.defaultAdminEmail || !env.defaultAdminPassword) {
    logger.warn("Default admin seeding skipped. Set DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD to enable.");
    return null;
  }

  const email = env.defaultAdminEmail.toLowerCase().trim();
  const existing = await User.findOne({ email });

  if (existing) {
    logger.info("Default admin already exists", { email });
    return existing;
  }

  const passwordHash = await hashPassword(env.defaultAdminPassword);

  const admin = await User.create({
    name: "Ankit Upadhyay",
    email,
    password: passwordHash,
    role: "admin",
    verified: true,
    profileImageUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"
  });

  logger.info("Default admin created", { email });
  return admin;
};

module.exports = {
  ensureDefaultAdmin
};
