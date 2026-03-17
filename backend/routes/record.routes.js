const express = require("express");
const {
  uploadRecord,
  listRecords,
  getRecordById,
  decideRecord,
  deleteRecord,
  getMyTimeline
} = require("../controllers/record.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const { validate } = require("../middleware/validate.middleware");
const { uploadSingleRecordFile } = require("../middleware/upload");
const {
  createRecordSchema,
  listRecordQuerySchema,
  decisionSchema
} = require("../utils/validators/record.validator");

const router = express.Router();

router.use(authenticate);

router.post(
  "/upload",
  authorize("hospital", "admin"),
  uploadSingleRecordFile,
  validate(createRecordSchema),
  uploadRecord
);

router.get("/", validate(listRecordQuerySchema, "query"), listRecords);
router.get("/timeline/me", authorize("patient"), getMyTimeline);
router.get("/:id", getRecordById);
router.patch(
  "/:id/decision",
  authorize("patient"),
  validate(decisionSchema),
  decideRecord
);
router.delete("/:id", authorize("hospital", "admin"), deleteRecord);

module.exports = router;
