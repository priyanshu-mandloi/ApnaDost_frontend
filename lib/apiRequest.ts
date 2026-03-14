import Cookies from "js-cookie";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request if present
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default apiClient;

// ── Auth helpers ──────────────────────────────────────────
export const authApi = {
  register: async (email: string, password: string) => {
    const res = await apiClient.post("/api/auth/register", { email, password });
    return res.data as { token: string };
  },

  login: async (email: string, password: string) => {
    const res = await apiClient.post("/api/auth/login", { email, password });
    return res.data as { token: string };
  },
};

// ── Token helpers ─────────────────────────────────────────
export const saveToken = (token: string) => {
  Cookies.set("token", token, {
    expires: 1, // 1 day (matches jwt.expiration = 86400000ms)
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
};

export const removeToken = () => {
  Cookies.remove("token");
};

export const getToken = () => Cookies.get("token");
