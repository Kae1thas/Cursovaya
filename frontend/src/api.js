// api.js
import axios from 'axios';

export const getEvents = async () => {
    try {
        const response = await axios.get('http://localhost:8000/api/events/'); // правильный путь к API
        return response.data;
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        return [];
    }
};
