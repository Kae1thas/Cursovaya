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
export const getRequests = () => axiosClient.get("/requests/");
export const getUserRole = async () => {
  try {
    const response = await axiosClient.get("/user-role/");
    return response.data.role || 'user';
  } catch (error) {
    console.error("Ошибка получения роли:", error);
    return 'user';  // По умолчанию 'user', если запрос не удался
  }
};
export const getUserProfile = async () => {
  const response = await axiosClient.get("/user-role/"); // Предполагаем, что возвращает и имя
  return response.data;
};

export default axiosClient;