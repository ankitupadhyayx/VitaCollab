import api from "@/services/api";

export const fetchMyNotifications = async () => {
  const response = await api.get("/notifications/my");
  return response.data;
};

export const markNotificationRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};
