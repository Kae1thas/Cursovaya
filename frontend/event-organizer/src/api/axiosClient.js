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
        const token = localStorage.getItem('token');  // Получаем токен из localStorage
        if (token) {
            config.headers['Authorization'] = `Token ${token}`;  // Добавляем токен в заголовки
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const getEvents = () => {
    return axiosClient.get('/events/');
};



export default axiosClient;
