import api from "@/services/api";

export const fetchMyTimeline = async (status) => {
  const response = await api.get("/records/timeline/me", { params: status ? { status } : {} });
  return response.data;
};

export const fetchRecords = async (params = {}) => {
  const response = await api.get("/records", { params });
  return response.data;
};

export const decideRecord = async (id, decision, rejectionReason) => {
  const response = await api.patch(`/records/${id}/decision`, {
    decision,
    rejectionReason
  });
  return response.data;
};

export const uploadRecord = async ({ patientId, type, description, file, recordDate }) => {
  const formData = new FormData();
  formData.append("patientId", patientId);
  formData.append("type", type);
  formData.append("description", description);
  if (recordDate) {
    formData.append("recordDate", recordDate);
  }
  if (file) {
    formData.append("file", file);
  }

  const response = await api.post("/records/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return response.data;
};

export const generateRecordShareLink = async (id) => {
  const response = await api.post(`/records/${id}/share-link`, {});
  return response.data;
};

export const fetchSharedRecord = async (token) => {
  const response = await api.get(`/records/shared/${token}`);
  return response.data;
};
