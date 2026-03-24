import api from "@/services/api";

const recordsInFlight = new Map();

export const fetchMyTimeline = async (status) => {
  const response = await api.get("/records/timeline/me", { params: status ? { status } : {} });
  return response.data;
};

export const fetchRecords = async (params = {}, options = {}) => {
  const key = JSON.stringify(params || {});

  if (recordsInFlight.has(key) && !options.force) {
    return recordsInFlight.get(key);
  }

  const request = api.get("/records", { params })
    .then((response) => response.data)
    .finally(() => {
      recordsInFlight.delete(key);
    });

  recordsInFlight.set(key, request);
  return request;
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

export const generateRecordShareLink = async (id, options = {}) => {
  const response = await api.post(`/records/${id}/share-link`, options);
  return response.data;
};

export const fetchSharedRecord = async (token) => {
  const response = await api.get(`/share/${token}`);
  return response.data;
};

export const fetchSecureRecordFileAccess = async (id, options = {}) => {
  const response = await api.get(`/files/${id}`, {
    params: {
      download: options.download === true
    }
  });
  return response.data;
};
