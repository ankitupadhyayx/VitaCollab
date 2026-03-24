const express = require("express");
const { getSharedRecordByToken } = require("../controllers/record.controller");
const { optionalAuthenticate } = require("../middleware/auth.middleware");
const { shareAccessLimiter } = require("../middleware/rateLimit.middleware");
const { validate } = require("../middleware/validate.middleware");
const { shareTokenParamSchema } = require("../utils/validators/share.validator");

const router = express.Router();

router.get(
  "/:token",
  shareAccessLimiter,
  optionalAuthenticate,
  validate(shareTokenParamSchema, "params"),
  getSharedRecordByToken
);

module.exports = router;
