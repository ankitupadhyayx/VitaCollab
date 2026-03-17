const express = require("express");
const { listMyNotifications, markNotificationRead } = require("../controllers/notification.controller");
const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate);
router.get("/my", listMyNotifications);
router.patch("/:id/read", markNotificationRead);

module.exports = router;
