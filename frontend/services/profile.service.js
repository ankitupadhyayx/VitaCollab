import api from "@/services/api";

let inFlightProfileRequest = null;

export const getProfile = async () => {
  if (inFlightProfileRequest) {
    return inFlightProfileRequest;
  }

  inFlightProfileRequest = api
    .get("/users/profile")
    .then((response) => response.data)
    .finally(() => {
      inFlightProfileRequest = null;
    });

  return inFlightProfileRequest;
};

export const updateProfile = async (payload, onUploadProgress) => {
  const formData = new FormData();

  Object.entries(payload || {}).forEach(([key, value]) => {
    if (typeof value === "undefined" || value === null || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      formData.append(key, value.join(","));
      return;
    }

    formData.append(key, value);
  });

  const response = await api.put("/users/profile/update", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    },
    onUploadProgress
  });

  return response.data;
};
