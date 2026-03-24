const express = require("express");
const { getRecordFileAccess, serveLegacyLocalFile } = require("../controllers/file.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");
const { fileAccessParamSchema, fileAccessQuerySchema } = require("../utils/validators/share.validator");

const router = express.Router();

router.use(authenticate);

router.get(
  "/:id",
  validate(fileAccessParamSchema, "params"),
  validate(fileAccessQuerySchema, "query"),
  getRecordFileAccess
);

router.get(
  "/:id/content",
  validate(fileAccessParamSchema, "params"),
  validate(fileAccessQuerySchema, "query"),
  serveLegacyLocalFile
);

module.exports = router;
