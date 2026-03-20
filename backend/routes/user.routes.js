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
	broadcastSystemAnnouncementAdmin,
	bulkUsersActionAdmin,
	exportAdminData,
	createAdminUser,
	updateAdminUser,
	deleteAdminUser
} = require("../controllers/user.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize, requirePermission } = require("../middleware/role.middleware");
const { validate } = require("../middleware/validate.middleware");
const { uploadProfileImage } = require("../middleware/profileUpload.middleware");
const {
	qrResolveSchema,
	updateProfileSchema,
	adminAuditQuerySchema,
	adminUserQuerySchema,
	adminUpdateUserStatusSchema,
	adminBroadcastSchema,
	adminCreateSchema,
	adminUpdateSchema,
	adminBulkUserActionSchema,
	adminExportQuerySchema
} = require("../utils/validators/user.validator");

const router = express.Router();

router.use(authenticate);
router.get("/profile", getMyProfile);
router.put("/profile/update", uploadProfileImage, validate(updateProfileSchema), updateMyProfile);
router.get("/profile/qr-token", authorize("patient"), getMyQrToken);
router.post("/profile/qr-resolve", authorize("hospital", "admin"), validate(qrResolveSchema), resolvePatientQr);
router.get("/admin/stats", authorize("admin"), requirePermission("VIEW_ACTIVITY"), getAdminStats);
router.get("/admin/audit-logs", authorize("admin"), requirePermission("VIEW_AUDIT"), validate(adminAuditQuerySchema, "query"), getAuditLogs);
router.get("/admin/activity", authorize("admin"), requirePermission("VIEW_ACTIVITY"), listActivityFeedAdmin);
router.get("/admin/users", authorize("admin"), requirePermission("MANAGE_USERS"), validate(adminUserQuerySchema, "query"), listUsersAdmin);
router.get("/admin/users/:id", authorize("admin"), requirePermission("MANAGE_USERS"), getUserByIdAdmin);
router.patch("/admin/users/:id/status", authorize("admin"), requirePermission("MANAGE_USERS"), validate(adminUpdateUserStatusSchema), updateUserStatusAdmin);
router.post("/admin/users/bulk-action", authorize("admin"), requirePermission("BULK_USERS"), validate(adminBulkUserActionSchema), bulkUsersActionAdmin);
router.get("/admin/hospitals/pending", authorize("admin"), requirePermission("VERIFY_HOSPITAL"), listPendingHospitals);
router.patch("/admin/hospitals/:id/verify", authorize("admin"), requirePermission("VERIFY_HOSPITAL"), verifyHospital);
router.get("/admin/sessions", authorize("admin"), requirePermission("VIEW_ACTIVITY"), listActiveSessionsAdmin);
router.post("/admin/users/:id/force-logout", authorize("admin"), requirePermission("FORCE_LOGOUT"), forceLogoutUserAdmin);
router.post("/admin/broadcast", authorize("admin"), requirePermission("BROADCAST"), validate(adminBroadcastSchema), broadcastSystemAnnouncementAdmin);
router.get("/admin/export", authorize("admin"), requirePermission("EXPORT"), validate(adminExportQuerySchema, "query"), exportAdminData);
router.post("/admin/admins", authorize("admin"), requirePermission("MANAGE_ADMINS"), validate(adminCreateSchema), createAdminUser);
router.patch("/admin/admins/:id", authorize("admin"), requirePermission("MANAGE_ADMINS"), validate(adminUpdateSchema), updateAdminUser);
router.delete("/admin/admins/:id", authorize("admin"), requirePermission("MANAGE_ADMINS"), deleteAdminUser);

module.exports = router;
