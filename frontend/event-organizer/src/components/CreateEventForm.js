import React, { useState, useEffect } from "react";
import axiosClient, { getUserRole } from "../api/axiosClient";
import { toast } from "react-toastify";
import Modal from "react-modal";
import { motion } from "framer-motion";

const CreateEventForm = ({ onEventCreated, eventToEdit, onEventUpdated, onClose, isOpen }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [locationId, setLocationId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dateError, setDateError] = useState("");

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [locationsRes, categoriesRes] = await Promise.all([
            axiosClient.get("/locations/"),
            axiosClient.get("/categories/"),
          ]);
          setLocations(locationsRes.data);
          setCategories(categoriesRes.data);
        } catch (error) {
          toast.error("Ошибка загрузки данных.");
        }
      };
      fetchData();

      if (eventToEdit) {
        setTitle(eventToEdit.title);
        setDescription(eventToEdit.description || "");
        setStartTime(eventToEdit.start_time.slice(0, 16));
        setEndTime(eventToEdit.end_time.slice(0, 16));
        setLocationId(eventToEdit.location?.id || "");
        setCategoryId(eventToEdit.category?.id || "");
        setIsPublic(eventToEdit.is_public);
      } else {
        setTitle("");
        setDescription("");
        setStartTime("");
        setEndTime("");
        setLocationId("");
        setCategoryId("");
        setIsPublic(true);
      }
    }
  }, [isOpen, eventToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!title || !startTime || !endTime) {
      toast.error("Заполните все обязательные поля!");
      return;
    }
  
    if (new Date(endTime) <= new Date(startTime)) {
      toast.error("Дата окончания должна быть позже даты начала!");
      return;
    }

    const eventData = {
      title,
      description,
      start_time: startTime,
      end_time: endTime,
      is_public: isPublic,
      location_id: locationId || null,
      category_id: categoryId || null,
    };
  
    try {
      console.log("Отправляемые данные:", eventData);
      const role = await getUserRole();
      if (role === "user") {
        await axiosClient.post("/requests/", {
          request_type: "event",
          action: "create",
          data: eventData,
        });
        toast.success("Заявка на создание мероприятия отправлена!");
      } else if (role === "moderator" || role === "admin") {
        const response = eventToEdit
          ? await axiosClient.put(`/events/${eventToEdit.id}/`, eventData)
          : await axiosClient.post("/events/", eventData);
        toast.success(eventToEdit ? "Мероприятие обновлено!" : "Мероприятие создано!");
        eventToEdit ? onEventUpdated(response.data) : onEventCreated(response.data);
      }
      onClose();
    } catch (error) {
      console.error("Ошибка:", error.response?.data || error.message);
      toast.error("Ошибка при сохранении.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Create or Edit Event"
      style={{
        overlay: { backgroundColor: "rgba(0, 0, 0, 0.6)", zIndex: 1000 },
        content: {
          maxWidth: "600px",
          margin: "auto",
          padding: "20px",
          borderRadius: "10px",
          backgroundColor: "white",
        },
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="p-6 flex flex-col"
      >
        <h2 className="text-2xl font-semibold text-center mb-6">
          {eventToEdit ? "Редактировать мероприятие" : "Создать мероприятие"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Название *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <textarea
            placeholder="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
          />
          <input
            type="datetime-local"
            max="2100-12-31T23:59"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="datetime-local"
            max="2100-12-31T23:59"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <select
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Выберите локацию</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.city || "Без города"})
              </option>
            ))}
          </select>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Выберите категорию</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-5 w-5 text-blue-500"
            />
            <span>Публичное мероприятие</span>
          </label>
          {dateError && <p className="text-red-500 text-sm">{dateError}</p>}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white py-2 px-6 rounded-md hover:bg-gray-600 transition-colors"
            >
              Закрыть
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition-colors"
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