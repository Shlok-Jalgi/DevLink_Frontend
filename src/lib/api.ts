import axios from "axios";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
const backendUrl =
  typeof window !== "undefined"
    ? NEXT_PUBLIC_API_URL || `https://devlink-backend-dnk0.onrender.com`
    : NEXT_PUBLIC_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: `${backendUrl}/api`, // Backend runs on port 3001
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers["x-auth-token"] = token;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
