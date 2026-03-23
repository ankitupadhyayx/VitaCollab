import api from "@/services/api";

export const fetchHospitalPatients = async (params = {}) => {
  const response = await api.get("/hospital/patients", { params });
  return response.data;
};
