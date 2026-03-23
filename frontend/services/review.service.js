import api from "@/services/api";

let inFlightMyReviewsRequest = null;
const inFlightPublicReviewsRequests = new Map();

const toPublicReviewsKey = (params = {}) => {
  const normalized = Object.entries(params)
    .filter(([, value]) => typeof value !== "undefined" && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b));

  return JSON.stringify(normalized);
};

export const submitReview = async (payload) => {
  const response = await api.post("/reviews", payload);
  return response.data;
};

export const fetchApprovedReviews = async (params = {}) => {
  const key = toPublicReviewsKey(params);
  const existing = inFlightPublicReviewsRequests.get(key);
  if (existing) {
    return existing;
  }

  const request = api
    .get("/reviews/public", { params })
    .then((response) => response.data)
    .finally(() => {
      inFlightPublicReviewsRequests.delete(key);
    });

  inFlightPublicReviewsRequests.set(key, request);
  return request;
};

export const fetchMyReviews = async () => {
  if (inFlightMyReviewsRequest) {
    return inFlightMyReviewsRequest;
  }

  inFlightMyReviewsRequest = api
    .get("/reviews/my")
    .then((response) => response.data)
    .finally(() => {
      inFlightMyReviewsRequest = null;
    });

  return inFlightMyReviewsRequest;
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
