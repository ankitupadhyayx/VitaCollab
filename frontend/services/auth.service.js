import api from "@/services/api";

export const registerUser = async (payload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (typeof value !== "undefined" && value !== null && value !== "") {
      formData.append(key, value);
    }
  });

  const response = await api.post("/auth/register", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data;
};

export const loginUser = async (payload) => {
  const response = await api.post("/auth/login", payload);
  return response.data;
};

export const refreshAuth = async () => {
  const response = await api.post("/auth/refresh", {});
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post("/auth/logout", {});
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async ({ token, newPassword }) => {
  const response = await api.post("/auth/reset-password", { token, newPassword });
  return response.data;
};
