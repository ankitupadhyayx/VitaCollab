const { StatusCodes } = require("http-status-codes");
const mongoose = require("mongoose");
const { Review, User } = require("../models");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { API_MESSAGES } = require("../utils/apiMessages");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const isReviewDeleted = (review) => {
  const status = String(review.status || "").toLowerCase();
  return review.isDeleted === true || status === "deleted";
};

const isReviewPublished = (review) => {
  const status = String(review.status || "").toLowerCase();
  if (isReviewDeleted(review)) {
    return false;
  }

  if (status === "rejected") {
    return false;
  }

  return review.isPublished !== false;
};

const normalizedReviewStatus = (review) => (isReviewDeleted(review) ? "deleted" : "active");

const toReviewPayload = (review) => ({
  id: review._id,
  userId: review.userId?._id || review.userId,
  userName: review.userId?.name || "Anonymous",
  userProfileImageUrl: review.userId?.profileImageUrl || null,
  role: review.role,
  target: review.target,
  targetHospitalId: review.targetHospitalId || null,
  targetHospitalName: review.targetHospitalName || null,
  rating: review.rating,
  comment: review.comment,
  status: normalizedReviewStatus(review),
  legacyStatus: review.status,
  isPublished: isReviewPublished(review),
  isDeleted: isReviewDeleted(review),
  moderationNote: review.moderationNote,
  moderatedBy: review.moderatedBy,
  moderatedAt: review.moderatedAt,
  createdAt: review.createdAt,
  updatedAt: review.updatedAt
});

const createReview = async (req, res, next) => {
  try {
    const { target, targetHospitalId, rating, comment } = req.body;

    if (!["patient", "hospital"].includes(req.user.role)) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(errorResponse({ message: API_MESSAGES.REVIEWS.SUBMIT_ROLE_NOT_ALLOWED }));
    }

    if (req.user.role === "hospital" && target !== "platform") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse({ message: API_MESSAGES.REVIEWS.TARGET_RESTRICTION_HOSPITAL }));
    }

    if (req.user.role === "patient" && !["hospital", "platform"].includes(target)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse({ message: API_MESSAGES.REVIEWS.TARGET_RESTRICTION_PATIENT }));
    }

    const lastReview = await Review.findOne({ userId: req.user.id }).sort({ createdAt: -1 }).select("createdAt");
    if (lastReview && Date.now() - new Date(lastReview.createdAt).getTime() < 60 * 1000) {
      return res
        .status(StatusCodes.TOO_MANY_REQUESTS)
        .json(errorResponse({ message: API_MESSAGES.REVIEWS.RATE_LIMIT_LOCAL }));
    }

    let hospitalTarget = null;
    if (target === "hospital") {
      if (!targetHospitalId || !isValidObjectId(targetHospitalId)) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(errorResponse({ message: API_MESSAGES.REVIEWS.HOSPITAL_TARGET_REQUIRED }));
      }

      hospitalTarget = await User.findOne({ _id: targetHospitalId, role: "hospital" }).select("name");
      if (!hospitalTarget) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(errorResponse({ message: API_MESSAGES.REVIEWS.HOSPITAL_TARGET_INVALID }));
      }
    }

    const review = await Review.create({
      userId: req.user.id,
      role: req.user.role,
      target,
      targetHospitalId: target === "hospital" ? hospitalTarget._id : null,
      targetHospitalName: target === "hospital" ? hospitalTarget.name : null,
      rating,
      comment,
      status: "active",
      isPublished: true,
      isDeleted: false
    });

    return res.status(StatusCodes.CREATED).json(
      successResponse({
        message: API_MESSAGES.REVIEWS.REVIEW_SUBMITTED,
        data: { review: toReviewPayload(review) }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const listApprovedReviews = async (req, res, next) => {
  try {
    const { target, hospitalId } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {
      isDeleted: { $ne: true },
      isPublished: { $ne: false },
      status: { $nin: ["deleted", "rejected"] }
    };
    if (target) {
      filter.target = target;
    }
    if (hospitalId) {
      filter.targetHospitalId = hospitalId;
    }

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name role profileImageUrl"),
      Review.countDocuments(filter)
    ]);

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: API_MESSAGES.REVIEWS.APPROVED_FETCHED,
        data: {
          reviews: reviews.map(toReviewPayload),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit))
          }
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const listMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate("userId", "name role profileImageUrl");

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: API_MESSAGES.REVIEWS.MY_REVIEWS_FETCHED,
        data: {
          reviews: reviews.map(toReviewPayload)
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const listReviewsAdmin = async (req, res, next) => {
  try {
    const { status } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) {
      if (status === "active") {
        filter.$and = [
          { isDeleted: { $ne: true } },
          { status: { $ne: "deleted" } }
        ];
      } else if (status === "deleted") {
        filter.$or = [{ isDeleted: true }, { status: "deleted" }];
      } else {
        filter.status = status;
      }
    }

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name role profileImageUrl"),
      Review.countDocuments(filter)
    ]);

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: API_MESSAGES.REVIEWS.APPROVED_FETCHED,
        data: {
          reviews: reviews.map(toReviewPayload),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit))
          }
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const moderateReviewAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, moderationNote, isPublished, isDeleted } = req.body;

    if (!isValidObjectId(id)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse({ message: API_MESSAGES.REVIEWS.REVIEW_NOT_FOUND }));
    }

    const review = await Review.findById(id);
    if (!review) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(errorResponse({ message: API_MESSAGES.REVIEWS.REVIEW_NOT_FOUND }));
    }

    if (status === "approved") {
      review.isPublished = true;
      review.isDeleted = false;
    } else if (status === "rejected" || status === "pending") {
      review.isPublished = false;
      review.isDeleted = false;
    } else if (status === "active") {
      review.isDeleted = false;
      if (typeof review.isPublished === "undefined") {
        review.isPublished = true;
      }
    } else if (status === "deleted") {
      review.isDeleted = true;
      review.isPublished = false;
    }

    if (typeof isPublished === "boolean") {
      review.isPublished = isPublished;
    }

    if (typeof isDeleted === "boolean") {
      review.isDeleted = isDeleted;
      if (isDeleted) {
        review.isPublished = false;
      }
    }

    review.status = review.isDeleted ? "deleted" : "active";
    review.moderationNote = typeof moderationNote === "string" ? moderationNote : review.moderationNote;
    review.moderatedBy = req.user.id;
    review.moderatedAt = new Date();

    await review.save();

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: API_MESSAGES.REVIEWS.REVIEW_MODERATED,
        data: { review: toReviewPayload(review) }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const deleteReviewAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse({ message: API_MESSAGES.REVIEWS.REVIEW_NOT_FOUND }));
    }

    const review = await Review.findById(id);
    if (!review) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(errorResponse({ message: API_MESSAGES.REVIEWS.REVIEW_NOT_FOUND }));
    }

    review.isDeleted = true;
    review.isPublished = false;
    review.status = "deleted";
    review.moderatedBy = req.user.id;
    review.moderatedAt = new Date();
    await review.save();

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: API_MESSAGES.REVIEWS.REVIEW_DELETED
      })
    );
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createReview,
  listApprovedReviews,
  listMyReviews,
  listReviewsAdmin,
  moderateReviewAdmin,
  deleteReviewAdmin
};
