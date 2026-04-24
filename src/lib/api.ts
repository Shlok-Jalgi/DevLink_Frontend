import axios from "axios";

// 1. Prioritize the Environment Variable. 
// 2. Ensure the fallback for the browser is ALWAYS the HTTPS Render link.
const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

const backendUrl = NEXT_PUBLIC_API_URL || "https://devlink-backend-dnk0.onrender.com";

const api = axios.create({
  baseURL: `${backendUrl}/api`, 
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