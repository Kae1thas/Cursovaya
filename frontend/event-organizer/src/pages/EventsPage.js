import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import CreateEventForm from '../components/CreateEventForm';
import DeleteConfirmModal from '../components/DeleteConfirmModal'; // Импортируем новый компонент

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/events/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Ошибка загрузки событий:', error);
      toast.error('Ошибка при загрузке событий.');
    }
  };

  const handleEventCreated = (newEvent) => {
    setEvents((prevEvents) => [...prevEvents, newEvent]);
  };

  const handleEventUpdated = (updatedEvent) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) => (event.id === updatedEvent.id ? updatedEvent : event))
    );
  };

  const handleEventDeleted = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:8000/api/events/${eventToDelete.id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventToDelete.id));
      toast.success('Мероприятие удалено.');
      closeDeleteConfirmModal();
    } catch (error) {
      console.error('Ошибка при удалении мероприятия:', error);
      toast.error('Ошибка при удалении мероприятия.');
      closeDeleteConfirmModal();
    }
  };

  const openEditModal = (event) => {
    setEventToEdit(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEventToEdit(null);
    setIsModalOpen(false);
  };

  const openDeleteConfirmModal = (event) => {
    setEventToDelete(event);
    setIsDeleteConfirmModalOpen(true);
  };

  const closeDeleteConfirmModal = () => {
    setEventToDelete(null);
    setIsDeleteConfirmModalOpen(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Список мероприятий</h1>

      {/* Кнопка открытия модального окна для создания нового мероприятия */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-green-500 text-white py-2 px-4 rounded-md mb-4 hover:bg-green-600"
      >
        Создать новое мероприятие
      </button>

      {/* Модальное окно для создания/редактирования мероприятия */}
      <CreateEventForm
        onEventCreated={handleEventCreated}
        eventToEdit={eventToEdit}
        onEventUpdated={handleEventUpdated}
        onClose={closeModal}
        isOpen={isModalOpen}
      />

      {/* Список мероприятий */}
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="bg-white shadow-md p-4 rounded-lg flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{event.title}</h2>
              <p>{event.start_time} - {event.end_time}</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => openEditModal(event)}
                className="text-blue-500"
              >
                Редактировать
              </button>
              <button
                onClick={() => openDeleteConfirmModal(event)}
                className="text-red-500"
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Модальное окно подтверждения удаления */}
      <DeleteConfirmModal
        isOpen={isDeleteConfirmModalOpen}
        onClose={closeDeleteConfirmModal}
        onConfirm={handleEventDeleted}
      />
    </div>
  );
};

export default EventsPage;
