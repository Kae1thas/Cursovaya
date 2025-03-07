import React, { useEffect, useState } from "react";
import axios from "axios";
import CreateEventForm from "../components/CreateEventForm";

const EventsPage = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("Ошибка: токен отсутствует");
          return;
        }

        const response = await axios.get("http://localhost:8000/api/events/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        setEvents(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Ошибка загрузки событий:", error);
      }
    };

    fetchEvents();
  }, []);

  const handleEventCreated = (newEvent) => {
    setEvents((prevEvents) => [...prevEvents, newEvent]);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Список мероприятий</h1>
      
      <CreateEventForm onEventCreated={handleEventCreated} />

      {events.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {events.map((event) => (
            <li key={event.id} className="p-4 bg-gray-100 rounded-lg shadow">
              <h3 className="text-xl font-semibold">{event.title}</h3>
              <p>{event.description}</p>
              <p>
                <strong>Начало:</strong> {new Date(event.start_time).toLocaleString()}
              </p>
              <p>
                <strong>Окончание:</strong> {new Date(event.end_time).toLocaleString()}
              </p>
              {event.location && <p><strong>Место:</strong> {event.location}</p>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500 mt-6">Мероприятий пока нет.</p>
      )}
    </div>
  );
};

export default EventsPage;
