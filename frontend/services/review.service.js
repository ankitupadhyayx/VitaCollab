import api from "@/services/api";

export const submitReview = async (payload) => {
  const response = await api.post("/reviews", payload);
  return response.data;
};

export const fetchApprovedReviews = async (params = {}) => {
  const response = await api.get("/reviews/public", { params });
  return response.data;
};

export const fetchMyReviews = async () => {
  const response = await api.get("/reviews/my");
  return response.data;
};

export const fetchAdminReviews = async (params = {}) => {
  const response = await api.get("/reviews/admin", { params });
  return response.data;
};

export const moderateAdminReview = async (id, payload) => {
  const response = await api.patch(`/reviews/admin/${id}/status`, payload);
  return response.data;
};

export const deleteAdminReview = async (id) => {
  const response = await api.delete(`/reviews/admin/${id}`);
  return response.data;
};
