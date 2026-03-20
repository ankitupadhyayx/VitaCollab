const { hashPassword } = require("../utils/password");
const adminRepository = require("../repositories/admin.repository");

const createAdminAccount = async ({ name, email, password, adminRole }) => {
  const normalizedEmail = email.toLowerCase();
  const existing = await adminRepository.findUserByEmail(normalizedEmail);
  if (existing) {
    const error = new Error("Email already exists");
    error.code = "EMAIL_EXISTS";
    throw error;
  }

  return adminRepository.createUser({
    name,
    email: normalizedEmail,
    password: await hashPassword(password),
    role: "admin",
    adminRole,
    accountStatus: "active",
    verified: true,
    isVerified: true,
    profileImageUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Admin"
  });
};

const getAdminAccount = async (id) => {
  const user = await adminRepository.findUserById(id);
  if (!user || user.role !== "admin") {
    return null;
  }
  return user;
};

const updateAdminAccount = async (id, payload) => {
  const user = await adminRepository.findUserById(id);
  if (!user || user.role !== "admin") {
    return null;
  }

  if (typeof payload.name === "string") {
    user.name = payload.name;
  }

  if (typeof payload.adminRole === "string") {
    user.adminRole = payload.adminRole;
  }

  if (typeof payload.accountStatus === "string") {
    user.accountStatus = payload.accountStatus;
  }

  await user.save();
  return user;
};

const deleteAdminAccount = async (id) => {
  return adminRepository.deleteUserById(id);
};

module.exports = {
  createAdminAccount,
  getAdminAccount,
  updateAdminAccount,
  deleteAdminAccount
};
