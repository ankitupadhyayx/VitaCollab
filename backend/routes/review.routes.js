const express = require("express");
const {
  createReview,
  listApprovedReviews,
  listMyReviews,
  listReviewsAdmin,
  moderateReviewAdmin,
  deleteReviewAdmin
} = require("../controllers/review.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const { validate } = require("../middleware/validate.middleware");
const { reviewSubmitLimiter } = require("../middleware/rateLimit.middleware");
const {
  createReviewSchema,
  listPublicReviewsQuerySchema,
  adminListReviewsQuerySchema,
  adminModerateReviewSchema
} = require("../utils/validators/review.validator");

const router = express.Router();

router.get("/public", validate(listPublicReviewsQuerySchema, "query"), listApprovedReviews);

router.use(authenticate);

router.post("/", authorize("patient", "hospital"), reviewSubmitLimiter, validate(createReviewSchema), createReview);
router.get("/my", authorize("patient", "hospital"), listMyReviews);

router.get("/admin", authorize("admin"), validate(adminListReviewsQuerySchema, "query"), listReviewsAdmin);
router.patch("/admin/:id/status", authorize("admin"), validate(adminModerateReviewSchema), moderateReviewAdmin);
router.delete("/admin/:id", authorize("admin"), deleteReviewAdmin);

module.exports = router;
