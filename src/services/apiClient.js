import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_DELCOM_BASEURL || "https://open-api.delcom.org/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
