import api from "@/services/api";

export const fetchAdminStats = async () => {
  const response = await api.get("/users/admin/stats");
  return response.data;
};

export const fetchAuditLogs = async (params = {}) => {
  const response = await api.get("/users/admin/audit-logs", { params });
  return response.data;
};

export const fetchActivityFeed = async (params = {}) => {
  const response = await api.get("/users/admin/activity", { params });
  return response.data;
};

export const fetchAdminUsers = async (params = {}) => {
  const response = await api.get("/users/admin/users", { params });
  return response.data;
};

export const fetchAdminUserProfile = async (id) => {
  const response = await api.get(`/users/admin/users/${id}`);
  return response.data;
};

export const updateAdminUserStatus = async (id, payload) => {
  const response = await api.patch(`/users/admin/users/${id}/status`, payload);
  return response.data;
};

export const bulkAdminUsersAction = async (payload) => {
  const response = await api.post("/users/admin/users/bulk-action", payload);
  return response.data;
};

export const fetchPendingHospitals = async () => {
  const response = await api.get("/users/admin/hospitals/pending");
  return response.data;
};

export const verifyHospital = async (hospitalId) => {
  const response = await api.patch(`/users/admin/hospitals/${hospitalId}/verify`);
  return response.data;
};

export const fetchAdminRecords = async (params = {}) => {
  const response = await api.get("/records", { params });
  return response.data;
};

export const forceRecordAction = async (id, payload) => {
  const response = await api.patch(`/records/${id}/admin-action`, payload);
  return response.data;
};

export const bulkRecordAction = async (payload) => {
  const response = await api.post("/records/admin/bulk-action", payload);
  return response.data;
};

export const fetchActiveSessions = async () => {
  const response = await api.get("/users/admin/sessions");
  return response.data;
};

export const forceLogoutUser = async (id) => {
  const response = await api.post(`/users/admin/users/${id}/force-logout`);
  return response.data;
};

export const sendAdminBroadcast = async (message) => {
  const response = await api.post("/users/admin/broadcast", { message });
  return response.data;
};

export const exportAdminDataset = async (params = {}) => {
  const response = await api.get("/users/admin/export", {
    params,
    responseType: "blob"
  });
  return response.data;
};

export const createAdmin = async (payload) => {
  const response = await api.post("/users/admin/admins", payload);
  return response.data;
};

export const updateAdmin = async (id, payload) => {
  const response = await api.patch(`/users/admin/admins/${id}`, payload);
  return response.data;
};

export const deleteAdmin = async (id) => {
  const response = await api.delete(`/users/admin/admins/${id}`);
  return response.data;
};

export const sendAuditClientLog = async (payload) => {
  const response = await api.post("/users/admin/activity", payload);
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
