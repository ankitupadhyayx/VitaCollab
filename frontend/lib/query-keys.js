export const queryKeys = {
  notifications: ["notifications"],
  records: ["records"],
  timeline: ["timeline"],
  profile: ["profile"],
  myReviews: ["reviews", "my"],
  publicReviews: (params = {}) => ["reviews", "public", params]
};
