const express = require("express");
const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");
const recordRoutes = require("./record.routes");
const notificationRoutes = require("./notification.routes");
const userRoutes = require("./user.routes");
const hospitalRoutes = require("./hospital.routes");
const reviewRoutes = require("./review.routes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/records", recordRoutes);
router.use("/notifications", notificationRoutes);
router.use("/users", userRoutes);
router.use("/hospital", hospitalRoutes);
router.use("/reviews", reviewRoutes);

module.exports = router;
