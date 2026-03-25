const express = require("express");
const { getSharedRecordByToken } = require("../controllers/record.controller");
const { optionalAuthenticate } = require("../middleware/auth.middleware");
const { shareAccessLimiter } = require("../middleware/rateLimit.middleware");
const { validate } = require("../middleware/validate.middleware");
const { shareTokenParamSchema } = require("../utils/validators/share.validator");
const env = require("../utils/env");

const router = express.Router();

const redirectHtmlShareRequests = (req, res, next) => {
  const acceptedType = req.accepts(["html", "json"]);

  if (acceptedType !== "html") {
    next();
    return;
  }

  const baseUrl = env.clientUrl || `${req.protocol}://${req.get("host")}`;
  const searchParams = new URLSearchParams(req.query || {});
  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : "";

  res.redirect(302, `${baseUrl}/share/${encodeURIComponent(req.params.token)}${suffix}`);
};

router.get(
  "/:token",
  redirectHtmlShareRequests,
  shareAccessLimiter,
  optionalAuthenticate,
  validate(shareTokenParamSchema, "params"),
  getSharedRecordByToken
);

module.exports = router;
