import React, { useState } from "react";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import Modal from "react-modal";
import { motion } from "framer-motion";

const RequestForm = ({ requestType, onClose, isOpen }) => {
  const [data, setData] = useState({
    name: "",  // Для category и location
    city: "",  // Только для location
    title: "", // Для event
    description: "", // Для event
    start_time: "", // Для event
    end_time: "",   // Для event
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let requestData = { request_type: requestType };
      if (requestType === "category") {
        requestData.data = { name: data.name };
      } else if (requestType === "location") {
        requestData.data = { name: data.name, city: data.city || null };
      } else if (requestType === "event") {
        if (!data.title || !data.start_time || !data.end_time) {
          toast.error("Заполните все обязательные поля!");
          return;
        }
        if (new Date(data.end_time) <= new Date(data.start_time)) {
          toast.error("Дата окончания должна быть позже даты начала!");
          return;
        }
        requestData.data = {
          title: data.title,
          description: data.description,
          start_time: data.start_time,
          end_time: data.end_time,
        };
      }

      console.log("Request data:", requestData); // Отладка
      await axiosClient.post("/requests/", requestData);
      toast.success("Заявка успешно отправлена!");
      onClose();
    } catch (error) {
      console.error("Ошибка:", error);
      toast.error("Ошибка при отправке заявки.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel={`Request ${requestType}`}
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
          {requestType === "category" ? "Создать категорию" :
           requestType === "location" ? "Создать локацию" : "Создать мероприятие"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {requestType === "category" && (
            <input
              type="text"
              placeholder="Название категории *"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          )}
          {requestType === "location" && (
            <>
              <input
                type="text"
                placeholder="Название локации *"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Город"
                value={data.city}
                onChange={(e) => setData({ ...data, city: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </>
          )}
          {requestType === "event" && (
            <>
              <input
                type="text"
                placeholder="Название мероприятия *"
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea
                placeholder="Описание"
                value={data.description}
                onChange={(e) => setData({ ...data, description: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
              />
              <input
                type="datetime-local"
                max="2100-12-31T23:59"
                value={data.start_time}
                onChange={(e) => setData({ ...data, start_time: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="datetime-local"
                max="2100-12-31T23:59"
                value={data.end_time}
                onChange={(e) => setData({ ...data, end_time: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </>
          )}
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
              Отправить заявку
            </button>
          </div>
        </form>
      </motion.div>
    </Modal>
  );
};

export default RequestForm;