import api from "@/services/api";

export const fetchAdminStats = async () => {
  const response = await api.get("/users/admin/stats");
  return response.data;
};

export const fetchAuditLogs = async () => {
  const response = await api.get("/users/admin/audit-logs");
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
