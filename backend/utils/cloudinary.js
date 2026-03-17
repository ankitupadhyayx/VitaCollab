const { v2: cloudinary } = require("cloudinary");
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

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
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

module.exports = {
  cloudinary,
  cloudinaryEnabled,
  uploadBufferToCloudinary
};
