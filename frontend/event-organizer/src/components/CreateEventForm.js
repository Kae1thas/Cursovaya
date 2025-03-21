import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Modal from "react-modal";
import { motion } from "framer-motion";

const CreateEventForm = ({ onEventCreated, eventToEdit, onEventUpdated, onClose, isOpen }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [dateError, setDateError] = useState("");

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setDescription(eventToEdit.description || "");
      setStartTime(eventToEdit.start_time.slice(0, 16));
      setEndTime(eventToEdit.end_time.slice(0, 16));
      setLocation(eventToEdit.location || "");
    } else {
      setTitle("");
      setDescription("");
      setStartTime("");
      setEndTime("");
      setLocation("");
    }
  }, [eventToEdit]);

  useEffect(() => {
    if (startTime && endTime) {
      if (new Date(endTime) < new Date(startTime)) {
        setDateError("Дата окончания не может быть раньше даты начала!");
      } else {
        setDateError("");
      }
    }
  }, [startTime, endTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !startTime || !endTime) {
      toast.error("Заполните все обязательные поля!");
      return;
    }

    if (dateError) {
      toast.error(dateError);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = eventToEdit
        ? await axios.put(
            `http://127.0.0.1:8000/api/events/${eventToEdit.id}/`,
            {
              title,
              description,
              start_time: startTime,
              end_time: endTime,
              location,
            },
            { headers: { Authorization: `Token ${token}` } }
          )
        : await axios.post(
            "http://127.0.0.1:8000/api/events/",
            {
              title,
              description,
              start_time: startTime,
              end_time: endTime,
              location,
            },
            { headers: { Authorization: `Token ${token}` } }
          );

      toast.success(eventToEdit ? "Мероприятие успешно обновлено!" : "Мероприятие успешно создано!");
      if (eventToEdit) {
        onEventUpdated(response.data);
      } else {
        onEventCreated(response.data);
      }

      setTitle("");
      setDescription("");
      setStartTime("");
      setEndTime("");
      setLocation("");
      onClose();
    } catch (error) {
      console.error("Ошибка создания/редактирования:", error);
      toast.error("Ошибка при создании/редактировании мероприятия.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Create or Edit Event"
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.6)', // Темный полупрозрачный фон
          zIndex: 1000, // Чтобы модальное окно было сверху
        },
        content: {
          maxWidth: '500px',
          margin: 'auto', // Центрируем окно
          padding: '20px',
          borderRadius: '10px',
          backgroundColor: 'white', // Белый фон для формы
          position: 'relative',
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-6 flex flex-col"
      >
        <h2 className="text-2xl font-semibold text-center mb-4">
          {eventToEdit ? "Редактировать мероприятие" : "Создать мероприятие"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Название"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <textarea
            placeholder="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <input
            type="datetime-local"
            max="2100-12-31T23:59"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <input
            type="datetime-local"
            max="2100-12-31T23:59"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            placeholder="Место"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          {dateError && <p className="text-red-500 text-sm">{dateError}</p>}
          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
            >
              Закрыть
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              {eventToEdit ? "Обновить" : "Создать"}
            </button>
          </div>
        </form>
      </motion.div>
    </Modal>
  );
};

export default CreateEventForm;
