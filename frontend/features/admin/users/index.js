export const toUserExportRow = (user) => ({
  ...user,
  lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt).toISOString() : ""
});

export const getUserRiskLabel = (score = 0) => {
  if (score >= 70) return "High";
  if (score >= 35) return "Medium";
  return "Low";
};
