import React, { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import Modal from "react-modal";
import { motion } from "framer-motion";

const RequestForm = ({ requestType, action = "create", eventToEdit, onClose, isOpen }) => {
  const [data, setData] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    location_id: "",
    category_id: "",
    is_public: true,
    is_one_time_location: false, // Добавляем флаг для одноразовой локации
    location_name: "",
    location_city: "",
    location_address: "",
    location_capacity: "",
  });
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (isOpen && requestType === "event") {
      const fetchData = async () => {
        try {
          const [locationsRes, categoriesRes] = await Promise.all([
            axiosClient.get("/locations/"),
            axiosClient.get("/categories/"),
          ]);
          setLocations(locationsRes.data.filter(loc => !loc.is_one_time)); // Фильтруем одноразовые локации
          setCategories(categoriesRes.data.filter(cat => !cat.is_one_time));
        } catch (error) {
          toast.error("Ошибка загрузки данных.");
        }
      };
      fetchData();

      if (eventToEdit && action !== "create") {
        setData({
          title: eventToEdit.title,
          description: eventToEdit.description || "",
          start_time: eventToEdit.start_time.slice(0, 16),
          end_time: eventToEdit.end_time.slice(0, 16),
          location_id: eventToEdit.location?.id || "",
          category_id: eventToEdit.category?.id || "",
          is_public: eventToEdit.is_public,
          is_one_time_location: false, // При редактировании не используем одноразовую локацию
          location_name: "",
          location_city: "",
          location_address: "",
          location_capacity: "",
        });
      } else {
        setData({
          title: "",
          description: "",
          start_time: "",
          end_time: "",
          location_id: "",
          category_id: "",
          is_public: true,
          is_one_time_location: false,
          location_name: "",
          location_city: "",
          location_address: "",
          location_capacity: "",
        });
      }
    }
  }, [isOpen, requestType, eventToEdit, action]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let requestData = { request_type: requestType, action };
      if (requestType === "event") {
        if (action === "create" || action === "update") {
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
            is_public: data.is_public,
          };
          if (data.is_one_time_location) {
            if (!data.location_name) {
              toast.error("Укажите название одноразовой локации!");
              return;
            }
            requestData.data.location_is_one_time = true;
            requestData.data.location_name = data.location_name;
            requestData.data.location_city = data.location_city;
            requestData.data.location_address = data.location_address;
            requestData.data.location_capacity = data.location_capacity || null;
          } else {
            requestData.data.location_id = data.location_id || null;
          }
          requestData.data.category_id = data.category_id || null;

          if (action === "update" || action === "delete") {
            requestData.event = eventToEdit.id;
          }
        } else if (action === "delete") {
          requestData.event = eventToEdit.id;
          requestData.data = {};
        }
      } else {
        requestData.data = { name: data.name, city: data.city || null };
      }

      console.log("Request data:", requestData);
      await axiosClient.post("/requests/", requestData);
      toast.success("Заявка успешно отправлена!");
      onClose();
    } catch (error) {
      console.error("Ошибка:", error.response?.data || error.message);
      toast.error("Ошибка при отправке заявки.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel={`${action} ${requestType}`}
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
          {requestType === "event"
            ? action === "create"
              ? "Создать мероприятие"
              : action === "update"
              ? "Редактировать мероприятие"
              : "Удалить мероприятие"
            : requestType === "category"
            ? "Создать категорию"
            : "Создать локацию"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {requestType === "event" && action !== "delete" && (
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
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={data.is_one_time_location}
                    onChange={(e) => setData({ ...data, is_one_time_location: e.target.checked })}
                    className="h-5 w-5 text-blue-500"
                  />
                  <span>Одноразовая локация</span>
                </label>
                {data.is_one_time_location ? (
                  <>
                    <input
                      type="text"
                      placeholder="Название локации *"
                      value={data.location_name}
                      onChange={(e) => setData({ ...data, location_name: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Город"
                      value={data.location_city}
                      onChange={(e) => setData({ ...data, location_city: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      placeholder="Адрес"
                      value={data.location_address}
                      onChange={(e) => setData({ ...data, location_address: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="2"
                    />
                    <input
                      type="number"
                      placeholder="Вместимость"
                      value={data.location_capacity}
                      onChange={(e) => setData({ ...data, location_capacity: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </>
                ) : (
                  <select
                    value={data.location_id}
                    onChange={(e) => setData({ ...data, location_id: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Выберите локацию</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.city || "Без города"})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <select
                value={data.category_id}
                onChange={(e) => setData({ ...data, category_id: e.target.value })}
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
                  checked={data.is_public}
                  onChange={(e) => setData({ ...data, is_public: e.target.checked })}
                  className="h-5 w-5 text-blue-500"
                />
                <span>Публичное мероприятие</span>
              </label>
            </>
          )}
          {requestType === "event" && action === "delete" && (
            <p className="text-gray-500">
              Вы уверены, что хотите удалить мероприятие "{eventToEdit?.title}"?
            </p>
          )}
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