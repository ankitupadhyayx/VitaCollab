const path = require("path");
const multer = require("multer");
const { StatusCodes } = require("http-status-codes");
const { errorResponse } = require("../utils/apiResponse");

const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 3 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    if (!allowedExtensions.has(ext) || !allowedMimeTypes.has(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, and WEBP profile images are allowed"));
    }
    return cb(null, true);
  }
});

const uploadProfileImage = (req, res, next) => {
  upload.single("profileImage")(req, res, (error) => {
    if (!error) {
      return next();
    }

    return res.status(StatusCodes.BAD_REQUEST).json(
      errorResponse({
        message: error.message || "Profile image upload failed"
      })
    );
  });
};

module.exports = {
  uploadProfileImage
};
