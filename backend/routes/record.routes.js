const express = require("express");
const {
  uploadRecord,
  listRecords,
  getRecordById,
  decideRecord,
  deleteRecord,
  getMyTimeline,
  adminForceRecordAction,
  adminBulkRecordAction,
  createRecordShareLink,
  getSharedRecordByToken,
  revokeRecordShareLink
} = require("../controllers/record.controller");
const { authenticate, optionalAuthenticate, requireHospitalVerified } = require("../middleware/auth.middleware");
const { authorize, requirePermission } = require("../middleware/role.middleware");
const { validate } = require("../middleware/validate.middleware");
const { shareCreateLimiter, shareAccessLimiter } = require("../middleware/rateLimit.middleware");
const { uploadSingleRecordFile } = require("../middleware/upload");
const {
  createRecordSchema,
  listRecordQuerySchema,
  decisionSchema,
  adminRecordActionSchema,
  adminBulkRecordActionSchema
} = require("../utils/validators/record.validator");
const {
  createShareLinkSchema,
  shareTokenParamSchema,
  revokeShareLinkParamSchema
} = require("../utils/validators/share.validator");

const router = express.Router();

router.get(
  "/shared/:token",
  shareAccessLimiter,
  optionalAuthenticate,
  validate(shareTokenParamSchema, "params"),
  getSharedRecordByToken
);

router.use(authenticate);

router.post(
  "/upload",
  authorize("hospital", "admin"),
  requireHospitalVerified,
  uploadSingleRecordFile,
  validate(createRecordSchema),
  uploadRecord
);

router.get("/", validate(listRecordQuerySchema, "query"), listRecords);
router.get("/timeline/me", authorize("patient"), getMyTimeline);
router.post(
  "/:id/share-link",
  authorize("patient", "admin"),
  shareCreateLimiter,
  validate(createShareLinkSchema),
  createRecordShareLink
);
router.delete(
  "/share-links/:shareId",
  authorize("patient", "hospital", "admin"),
  validate(revokeShareLinkParamSchema, "params"),
  revokeRecordShareLink
);
router.get("/:id", getRecordById);
router.patch(
  "/:id/decision",
  authorize("patient"),
  validate(decisionSchema),
  decideRecord
);
router.patch(
  "/:id/admin-action",
  authorize("admin"),
  requirePermission("MANAGE_RECORDS"),
  validate(adminRecordActionSchema),
  adminForceRecordAction
);
router.post(
  "/admin/bulk-action",
  authorize("admin"),
  requirePermission("BULK_RECORDS"),
  validate(adminBulkRecordActionSchema),
  adminBulkRecordAction
);
router.delete("/:id", authorize("hospital", "admin"), deleteRecord);

module.exports = router;
