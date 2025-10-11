import api from "./apiClient";

/**
 * 🔹 LOGIN USER
 * Endpoint: /auth/login
 */
export const loginUser = async (data) => {
  try {
    const res = await api.post("/auth/login", data, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (err) {
    console.error("Login error:", err.response || err);
    throw err.response?.data || { message: "Login gagal" };
  }
};

/**
 * 🔹 REGISTER USER
 * Endpoint: /auth/register
 */
export const registerUser = async (data) => {
  try {
    const res = await api.post("/auth/register", data, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (err) {
    console.error("Register error:", err.response || err);
    throw err.response?.data || { message: "Registrasi gagal" };
  }
};

/**
 * 🔹 SIMPAN TOKEN ke localStorage
 */
export const saveToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
  }
};

/**
 * 🔹 LOGOUT USER
 */
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
