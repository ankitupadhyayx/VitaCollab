const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDb = async (mongodbUri) => {
  try {
    await mongoose.connect(mongodbUri);
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error("MongoDB connection failed", { error: error.message });
    process.exit(1);
  }
};

module.exports = connectDb;
