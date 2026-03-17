const crypto = require("crypto");
const { hashToken } = require("./authTokens");

const createRandomToken = () => crypto.randomBytes(32).toString("hex");

const createTokenWithHash = () => {
  const token = createRandomToken();
  return {
    token,
    tokenHash: hashToken(token)
  };
};

module.exports = {
  createTokenWithHash
};
