const express = require("express");
const {
	getMyProfile,
	updateMyProfile,
	getMyQrToken,
	resolvePatientQr,
	getAdminStats,
	getAuditLogs,
	listPendingHospitals,
	verifyHospital,
	listUsersAdmin,
	getUserByIdAdmin,
	updateUserStatusAdmin,
	listActivityFeedAdmin,
	listActiveSessionsAdmin,
	forceLogoutUserAdmin,
	broadcastSystemAnnouncementAdmin
} = require("../controllers/user.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const { validate } = require("../middleware/validate.middleware");
const { uploadProfileImage } = require("../middleware/profileUpload.middleware");
const {
	qrResolveSchema,
	updateProfileSchema,
	adminAuditQuerySchema,
	adminUserQuerySchema,
	adminUpdateUserStatusSchema,
	adminBroadcastSchema
} = require("../utils/validators/user.validator");

const router = express.Router();

router.use(authenticate);
router.get("/profile", getMyProfile);
router.put("/profile/update", uploadProfileImage, validate(updateProfileSchema), updateMyProfile);
router.get("/profile/qr-token", authorize("patient"), getMyQrToken);
router.post("/profile/qr-resolve", authorize("hospital", "admin"), validate(qrResolveSchema), resolvePatientQr);
router.get("/admin/stats", authorize("admin"), getAdminStats);
router.get("/admin/audit-logs", authorize("admin"), validate(adminAuditQuerySchema, "query"), getAuditLogs);
router.get("/admin/activity", authorize("admin"), listActivityFeedAdmin);
router.get("/admin/users", authorize("admin"), validate(adminUserQuerySchema, "query"), listUsersAdmin);
router.get("/admin/users/:id", authorize("admin"), getUserByIdAdmin);
router.patch("/admin/users/:id/status", authorize("admin"), validate(adminUpdateUserStatusSchema), updateUserStatusAdmin);
router.get("/admin/hospitals/pending", authorize("admin"), listPendingHospitals);
router.patch("/admin/hospitals/:id/verify", authorize("admin"), verifyHospital);
router.get("/admin/sessions", authorize("admin"), listActiveSessionsAdmin);
router.post("/admin/users/:id/force-logout", authorize("admin"), forceLogoutUserAdmin);
router.post("/admin/broadcast", authorize("admin"), validate(adminBroadcastSchema), broadcastSystemAnnouncementAdmin);

module.exports = router;
