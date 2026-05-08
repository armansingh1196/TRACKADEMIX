import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5501"; // fallback for local dev

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return config;
    const user = JSON.parse(raw);
    const token = user?.token;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore localStorage parse errors
  }
  return config;
});

