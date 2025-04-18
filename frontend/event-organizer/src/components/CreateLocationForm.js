import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Modal from "react-modal";
import { motion } from "framer-motion";

const CreateLocationForm = ({ onLocationCreated, onLocationUpdated, locationToEdit, onClose, isOpen }) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [capacity, setCapacity] = useState("");

  useEffect(() => {
    if (locationToEdit) {
      setName(locationToEdit.name);
      setAddress(locationToEdit.address || "");
      setCity(locationToEdit.city || "");
      setCapacity(locationToEdit.capacity || "");
    } else {
      setName("");
      setAddress("");
      setCity("");
      setCapacity("");
    }
  }, [locationToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Название локации обязательно!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const data = {
        name: name.trim(),
        address: address.trim() || null,
        city: city.trim() || null,
        capacity: capacity ? parseInt(capacity) : null,
      };

      const response = locationToEdit
        ? await axios.put(
            `http://127.0.0.1:8000/api/locations/${locationToEdit.id}/`,
            data,
            { headers: { Authorization: `Token ${token}` } }
          )
        : await axios.post(
            "http://127.0.0.1:8000/api/locations/",
            data,
            { headers: { Authorization: `Token ${token}` } }
          );

      locationToEdit ? onLocationUpdated(response.data) : onLocationCreated(response.data);
    } catch (error) {
      console.error("Ошибка создания/редактирования локации:", error);
      toast.error("Ошибка при сохранении локации.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Create or Edit Location"
      style={{
        overlay: { backgroundColor: "rgba(0, 0, 0, 0.6)", zIndex: 1000 },
        content: {
          maxWidth: "500px",
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
          {locationToEdit ? "Редактировать локацию" : "Создать локацию"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Название *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <textarea
            placeholder="Адрес"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          />
          <input
            type="text"
            placeholder="Город"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Вместимость"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
          />
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
              {locationToEdit ? "Обновить" : "Создать"}
            </button>
          </div>
        </form>
      </motion.div>
    </Modal>
  );
};

export default CreateLocationForm;