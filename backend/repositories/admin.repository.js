const { User } = require("../models");

const findUserByEmail = (email) => User.findOne({ email });

const createUser = (payload) => User.create(payload);

const findUserById = (id) => User.findById(id);

const deleteUserById = (id) => User.deleteOne({ _id: id });

module.exports = {
  findUserByEmail,
  createUser,
  findUserById,
  deleteUserById
};
