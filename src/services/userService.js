import api from "./apiClient";

export const getMyProfile = async () => {
  const res = await api.get("/users/me");
  return res.data;
};
