import axios from "axios";

const API_URL = "http://localhost:8000/api";

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getEvents = () => axiosClient.get("/events/");
export const getLocations = () => axiosClient.get("/locations/");
export const getCategories = () => axiosClient.get("/categories/");

export default axiosClient;