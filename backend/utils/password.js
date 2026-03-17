const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 12;

const hashPassword = async (plainPassword) => bcrypt.hash(plainPassword, SALT_ROUNDS);
const comparePassword = async (plainPassword, hashedPassword) =>
  bcrypt.compare(plainPassword, hashedPassword);

module.exports = {
  hashPassword,
  comparePassword
};
