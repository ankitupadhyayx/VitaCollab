const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const { StatusCodes } = require("http-status-codes");
const { errorResponse } = require("../utils/apiResponse");
const env = require("../utils/env");
const {
  detectFileTypeFromSignature,
  hasExecutableSignature
} = require("../utils/fileSecurity");
const { scanFile } = require("../services/fileScanner.service");

const allowedExtensions = new Set([".pdf", ".jpg", ".jpeg", ".png"]);
const allowedMimeTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
const blockedExecutableExtensions = new Set([
  ".exe",
  ".dll",
  ".bat",
  ".cmd",
  ".com",
  ".msi",
  ".sh",
  ".js",
  ".mjs",
  ".cjs",
  ".ps1",
  ".php",
  ".py"
]);

const formatUploadErrorMessage = (error) => {
  if (!error) {
    return "File upload failed";
  }

  if (error.code === "LIMIT_FILE_SIZE") {
    return `File is too large. Maximum allowed size is ${env.recordUploadMaxMb}MB.`;
  }

  return error.message || "File upload failed";
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.recordUploadMaxMb * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    if (blockedExecutableExtensions.has(ext)) {
      return cb(new Error("Executable or script files are not allowed."));
    }

    if (!allowedExtensions.has(ext) || !allowedMimeTypes.has(file.mimetype)) {
      return cb(new Error("Only PDF, JPG, and PNG medical files are allowed."));
    }

    return cb(null, true);
  }
});

const uploadSingleRecordFile = (req, res, next) => {
  upload.single("file")(req, res, async (error) => {
    if (!error) {
      try {
        if (!req.file || !Buffer.isBuffer(req.file.buffer)) {
          return next();
        }

        const ext = path.extname(req.file.originalname || "").toLowerCase();
        const detectedType = detectFileTypeFromSignature(req.file.buffer);
        if (!detectedType.valid) {
          return res.status(StatusCodes.BAD_REQUEST).json(
            errorResponse({
              message: detectedType.reason || "Unable to validate file content."
            })
          );
        }

        if (hasExecutableSignature(req.file.buffer)) {
          return res.status(StatusCodes.BAD_REQUEST).json(
            errorResponse({
              message: "Executable content detected. Upload blocked for safety."
            })
          );
        }

        if (!allowedMimeTypes.has(detectedType.mimeType) || !detectedType.extensions.has(ext)) {
          return res.status(StatusCodes.BAD_REQUEST).json(
            errorResponse({
              message: "File type mismatch detected. Please upload a valid PDF, JPG, or PNG file."
            })
          );
        }

        if (req.file.mimetype !== detectedType.mimeType) {
          return res.status(StatusCodes.BAD_REQUEST).json(
            errorResponse({
              message: "Uploaded file metadata does not match file content."
            })
          );
        }

        const fileId = crypto.randomUUID
          ? crypto.randomUUID()
          : crypto.randomBytes(16).toString("hex");
        const scanResult = await scanFile(req.file.buffer, fileId);
        if (!scanResult.clean) {
          return res.status(StatusCodes.BAD_REQUEST).json(
            errorResponse({
              message: "File failed security scan"
            })
          );
        }

        req.file.scanFileId = fileId;
        req.file.validatedMimeType = detectedType.mimeType;
        req.file.validatedExtension = [...detectedType.extensions][0] || ext;

        return next();
      } catch (validationError) {
        return res.status(StatusCodes.BAD_REQUEST).json(
          errorResponse({
            message: validationError.message || "Unable to validate uploaded file."
          })
        );
      }
    }

    return res.status(StatusCodes.BAD_REQUEST).json(
      errorResponse({
        message: formatUploadErrorMessage(error)
      })
    );
  });
};

module.exports = {
  uploadSingleRecordFile
};