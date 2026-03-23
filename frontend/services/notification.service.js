import api from "@/services/api";

let notificationsInFlight = null;

export const fetchMyNotifications = async (options = {}) => {
  if (notificationsInFlight && !options.force) {
    return notificationsInFlight;
  }

  notificationsInFlight = api.get("/notifications/my")
    .then((response) => response.data)
    .finally(() => {
      notificationsInFlight = null;
    });

  return notificationsInFlight;
};

export const markNotificationRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};
