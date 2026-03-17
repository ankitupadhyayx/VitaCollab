const crypto = require("crypto");
const env = require("./env");

const algorithm = "aes-256-gcm";
const ivLength = 12;

const getKey = () => crypto.createHash("sha256").update(env.aesSecretKey).digest();

const encryptText = (plainText) => {
  if (!plainText) {
    return null;
  }

  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
};

const decryptText = (cipherText) => {
  if (!cipherText) {
    return null;
  }

  const [ivHex, authTagHex, encryptedHex] = cipherText.split(":");
  const decipher = crypto.createDecipheriv(algorithm, getKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final()
  ]);

  return decrypted.toString("utf8");
};

module.exports = {
  encryptText,
  decryptText
};
