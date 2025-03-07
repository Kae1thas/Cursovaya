import React, { useEffect, useState } from "react";
import axios from 'axios';

const EventsPage = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
          const token = localStorage.getItem('token'); // Получаем токен из localStorage
  
          if (!token) {
              console.error('Ошибка: токен отсутствует');
              return;
          }
  
          const response = await axios.get('http://localhost:8000/api/events/', {
              headers: {
                  Authorization: `Token ${token}`  // <-- Передаем токен в заголовке
              }
          });
          setEvents(response.data); // Записываем события в state
          console.log(response.data); // Данные с бэка
          return response.data;
  
      } catch (error) {
          console.error('Ошибка загрузки событий:', error);
      }
  };

    fetchEvents();
  }, []);

  return (
    <div>
        <h1>Список мероприятий</h1>
        {events.length > 0 ? (
            <ul>
                {events.map(event => (
                    <li key={event.id}>{event.title}</li>
                ))}
            </ul>
        ) : (
            <p>Мероприятий пока нет.</p>
        )}
    </div>
);

};

export default EventsPage;
