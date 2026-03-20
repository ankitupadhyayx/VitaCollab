import api from "@/services/api";

export const getMyQrToken = async () => {
  const response = await api.get("/users/profile/qr-token");
  return response.data;
};

export const resolvePatientQrToken = async (token) => {
  const response = await api.post("/users/profile/qr-resolve", { token });
  return response.data;
};
