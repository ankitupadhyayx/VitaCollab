const { v2: cloudinary } = require("cloudinary");
const crypto = require("crypto");
const env = require("./env");

const hasRealValue = (value) =>
  Boolean(value) && !String(value).toLowerCase().startsWith("replace_with_");

const cloudinaryEnabled =
  hasRealValue(env.cloudinaryCloudName) &&
  hasRealValue(env.cloudinaryApiKey) &&
  hasRealValue(env.cloudinaryApiSecret);

if (cloudinaryEnabled) {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    secure: true
  });
}

const uploadBufferToCloudinary = (buffer, folder, resourceType = "auto") =>
  new Promise((resolve, reject) => {
    if (!cloudinaryEnabled) {
      reject(new Error("Cloudinary is not configured"));
      return;
    }

    const secureFileId = crypto.randomUUID
      ? crypto.randomUUID()
      : crypto.randomBytes(16).toString("hex");

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: secureFileId,
        use_filename: false,
        unique_filename: true,
        resource_type: resourceType,
        overwrite: false
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          bytes: result.bytes,
          format: result.format
        });
      }
    );

    stream.end(buffer);
  });

const createSignedCloudinaryUrl = ({
  publicId,
  resourceType = "auto",
  expiresInSeconds = 180,
  asAttachment = false
}) => {
  if (!cloudinaryEnabled) {
    throw new Error("Cloudinary is not configured");
  }

  const expiresAt = Math.floor(Date.now() / 1000) + Number(expiresInSeconds || 180);

  const signedUrl = cloudinary.url(publicId, {
    resource_type: resourceType,
    type: "upload",
    secure: true,
    sign_url: true,
    expires_at: expiresAt,
    flags: asAttachment ? "attachment" : undefined
  });

  return {
    signedUrl,
    expiresAt: new Date(expiresAt * 1000)
  };
};

module.exports = {
  cloudinary,
  cloudinaryEnabled,
  uploadBufferToCloudinary,
  createSignedCloudinaryUrl
};
