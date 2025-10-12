import api from "./apiClient";

/**
 * 🔹 VALIDATE API RESPONSE
 * Helper function to validate API response structure
 */
const validateApiResponse = (response, expectedFields = []) => {
  if (!response || typeof response !== 'object') {
    return false;
  }
  
  if (expectedFields.length > 0) {
    return expectedFields.every(field => {
      const keys = field.split('.');
      let current = response;
      for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
          current = current[key];
        } else {
          return false;
        }
      }
      return true;
    });
  }
  
  return true;
};

/**
 * 🔹 LOGIN USER
 * Endpoint: /auth/login
 */
export const loginUser = async (data) => {
  try {
    // Validate required fields
    if (!data.email || !data.password) {
      throw { message: "Email dan password harus diisi" };
    }
    
    // Clean and validate data
    const cleanData = {
      email: data.email.trim().toLowerCase(),
      password: data.password
    };
    
    // Debug: Log the data being sent
    console.log("Login data being sent:", cleanData);
    
    const res = await api.post("/auth/login", cleanData, {
      headers: { "Content-Type": "application/json" },
    });
    
    // Validate response structure
    if (validateApiResponse(res.data, ['success', 'data.token', 'data.user'])) {
      return res.data;
    } else {
      throw new Error("Invalid response structure from login endpoint");
    }
  } catch (err) {
    console.error("Login error:", err.response || err);
    
    // Handle different error scenarios
    if (err.response?.status === 401) {
      throw { message: "Email atau password salah" };
    } else if (err.response?.status === 422) {
      throw { message: "Data tidak valid", errors: err.response.data.errors };
    } else if (err.response?.data) {
      throw err.response.data;
    } else {
      throw { message: "Login gagal, silakan coba lagi" };
    }
  }
};

/**
 * 🔹 REGISTER USER
 * Endpoint: /auth/register
 */
export const registerUser = async (data) => {
  try {
    // Validate required fields
    if (!data.name || !data.email || !data.password) {
      throw { message: "Semua field harus diisi" };
    }
    
    // Clean and validate data
    const cleanData = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password
    };
    
    // Debug: Log the data being sent
    console.log("Register data being sent:", cleanData);
    
    const res = await api.post("/auth/register", cleanData, {
      headers: { "Content-Type": "application/json" },
    });
    
    // Validate response structure
    if (validateApiResponse(res.data, ['success'])) {
      return res.data;
    } else {
      throw new Error("Invalid response structure from register endpoint");
    }
  } catch (err) {
    console.error("Register error:", err.response || err);
    console.error("Full error response:", err.response?.data);
    
    // Handle different error scenarios
    if (err.response?.status === 400) {
      // Handle 400 Bad Request specifically
      const errorData = err.response.data;
      if (errorData.errors) {
        // Handle validation errors
        const firstError = Object.values(errorData.errors)[0];
        throw { message: Array.isArray(firstError) ? firstError[0] : firstError };
      } else {
        throw { message: errorData.message || "Data tidak valid" };
      }
    } else if (err.response?.status === 422) {
      const errorData = err.response.data;
      if (errorData.errors) {
        // Handle validation errors
        const firstError = Object.values(errorData.errors)[0];
        throw { message: Array.isArray(firstError) ? firstError[0] : firstError };
      } else {
        throw { message: errorData.message || "Data tidak valid" };
      }
    } else if (err.response?.status === 409) {
      throw { message: "Email sudah terdaftar" };
    } else if (err.response?.data) {
      throw err.response.data;
    } else {
      throw { message: "Registrasi gagal, silakan coba lagi" };
    }
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
 * 🔹 GET TOKEN dari localStorage
 */
export const getToken = () => {
  return localStorage.getItem("token");
};

/**
 * 🔹 GET CURRENT USER dari localStorage
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

/**
 * 🔹 CHECK IF USER IS AUTHENTICATED
 */
export const isAuthenticated = () => {
  const token = getToken();
  const user = getCurrentUser();
  return !!(token && user);
};

/**
 * 🔹 LOGOUT USER
 */
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

/**
 * 🔹 TEST API CONNECTIVITY
 */
export const testApiConnection = async () => {
  try {
    const res = await api.get("/");
    console.log("API connection test:", res);
    return true;
  } catch (err) {
    console.error("API connection failed:", err);
    return false;
  }
};
