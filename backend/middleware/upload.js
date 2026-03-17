const path = require("path");
const multer = require("multer");
const { StatusCodes } = require("http-status-codes");
const { errorResponse } = require("../utils/apiResponse");

const allowedExtensions = new Set([".pdf", ".jpg", ".jpeg", ".png"]);
const allowedMimeTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    if (!allowedExtensions.has(ext) || !allowedMimeTypes.has(file.mimetype)) {
      return cb(new Error("Only PDF, JPG, and PNG files are allowed"));
    }
    return cb(null, true);
  }
});

const uploadSingleRecordFile = (req, res, next) => {
  upload.single("file")(req, res, (error) => {
    if (!error) {
      return next();
    }

    return res.status(StatusCodes.BAD_REQUEST).json(
      errorResponse({
        message: error.message || "File upload failed"
      })
    );
  });
};

module.exports = {
  uploadSingleRecordFile
};