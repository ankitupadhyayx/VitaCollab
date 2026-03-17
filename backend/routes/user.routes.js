const express = require("express");
const {
	getAdminStats,
	getAuditLogs,
	listPendingHospitals,
	verifyHospital
} = require("../controllers/user.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

const router = express.Router();

router.use(authenticate);
router.get("/admin/stats", authorize("admin"), getAdminStats);
router.get("/admin/audit-logs", authorize("admin"), getAuditLogs);
router.get("/admin/hospitals/pending", authorize("admin"), listPendingHospitals);
router.patch("/admin/hospitals/:id/verify", authorize("admin"), verifyHospital);

module.exports = router;
