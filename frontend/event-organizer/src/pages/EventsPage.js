import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import CreateEventForm from "../components/CreateEventForm";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import CreateLocationForm from "../components/CreateLocationForm";
import CreateCategoryForm from "../components/CreateCategoryForm";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("events");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        let eventsResponse;
  
        if (token) {
          // Для авторизованных — полный список мероприятий, категорий и локаций
          const [eventsRes, categoriesRes, locationsRes] = await Promise.all([
            axios.get("http://localhost:8000/api/events/", {
              headers: { Authorization: `Token ${token}` },
            }),
            axios.get("http://localhost:8000/api/categories/", {
              headers: { Authorization: `Token ${token}` },
            }),
            axios.get("http://localhost:8000/api/locations/", {
              headers: { Authorization: `Token ${token}` },
            }),
          ]);
          eventsResponse = eventsRes;
          setCategories(categoriesRes.data); // Присваиваем категории
          setLocations(locationsRes.data);   // Присваиваем локации
        } else {
          // Для неавторизованных — только публичные мероприятия
          eventsResponse = await axios.get("http://localhost:8000/api/public-events/");
          setCategories([]); // Категории и локации не нужны без авторизации
          setLocations([]);
        }
  
        setEvents(eventsResponse.data);
      } catch (error) {
        console.error("Ошибка загрузки данных:", error.response?.status, error.response?.data || error);
        toast.error("Ошибка при загрузке данных.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:8000/api/events/${eventToDelete.id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventToDelete.id));
      toast.success("Мероприятие удалено.");
      closeDeleteConfirmModal();
    } catch (error) {
      console.error("Ошибка при удалении:", error);
      toast.error("Ошибка при удалении мероприятия.");
      closeDeleteConfirmModal();
    }
  };

  const handleLocationCreated = (newLocation) => {
    setLocations((prevLocations) => [...prevLocations, newLocation]);
    toast.success("Локация создана!");
    closeLocationModal();
  };

  const handleCategoryCreated = (newCategory) => {
    setCategories((prevCategories) => [...prevCategories, newCategory]);
    toast.success("Категория создана!");
    closeCategoryModal();
  };

  const openEditModal = (event) => {
    setEventToEdit(event);
    setIsEventModalOpen(true);
  };

  const closeEventModal = () => {
    setEventToEdit(null);
    setIsEventModalOpen(false);
  };

  const openDeleteConfirmModal = (event) => {
    setEventToDelete(event);
    setIsDeleteConfirmModalOpen(true);
  };

  const closeDeleteConfirmModal = () => {
    setEventToDelete(null);
    setIsDeleteConfirmModalOpen(false);
  };

  const openLocationModal = () => {
    setIsLocationModalOpen(true);
  };

  const closeLocationModal = () => {
    setIsLocationModalOpen(false);
  };

  const openCategoryModal = () => {
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
  };

  return (
    <div className="h-full max-w-4xl mx-auto p-6 overflow-y-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Управление мероприятиями</h1>

      <div className="flex space-x-4 mb-6">
        {isAuthenticated && (
          <>
            <motion.button
              onClick={() => setIsEventModalOpen(true)}
              className="bg-green-500 text-white py-2 px-6 rounded-md hover:bg-green-600 transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Создать мероприятие
            </motion.button>
            <motion.button
              onClick={openLocationModal}
              className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Добавить локацию
            </motion.button>
            <motion.button
              onClick={openCategoryModal}
              className="bg-purple-500 text-white py-2 px-6 rounded-md hover:bg-purple-600 transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Добавить категорию
            </motion.button>
          </>
        )}
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("events")}
          className={`py-2 px-4 rounded-md ${activeTab === "events" ? "bg-gray-200" : "bg-gray-100"}`}
        >
          Мероприятия
        </button>
        <button
          onClick={() => {
            const token = localStorage.getItem("token");
            if (!token) {
              toast.info("Пожалуйста, войдите или зарегистрируйтесь для просмотра категорий.");
              navigate("/login");
            } else {
              setActiveTab("categories");
            }
          }}
          className={`py-2 px-4 rounded-md ${activeTab === "categories" ? "bg-gray-200" : "bg-gray-100"}`}
        >
          Категории
        </button>
        <button
          onClick={() => {
            const token = localStorage.getItem("token");
            if (!token) {
              toast.info("Пожалуйста, войдите или зарегистрируйтесь для просмотра локаций.");
              navigate("/login");
            } else {
              setActiveTab("locations");
            }
          }}
          className={`py-2 px-4 rounded-md ${activeTab === "locations" ? "bg-gray-200" : "bg-gray-100"}`}
        >
          Локации
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {activeTab === "events" && (
            <>
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="bg-gray-200 animate-pulse p-4 rounded-lg flex justify-between items-center"
                >
                  <div className="space-y-2">
                    <div className="h-6 w-48 bg-gray-300 rounded"></div>
                    <div className="h-4 w-64 bg-gray-300 rounded"></div>
                    <div className="h-4 w-32 bg-gray-300 rounded"></div>
                    <div className="h-4 w-40 bg-gray-300 rounded"></div>
                    <div className="h-4 w-36 bg-gray-300 rounded"></div>
                  </div>
                  <div className="flex space-x-4">
                    <div className="h-6 w-20 bg-gray-300 rounded"></div>
                    <div className="h-6 w-20 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </>
          )}
          {activeTab === "categories" && (
            <>
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="bg-gray-200 animate-pulse p-4 rounded-lg"
                >
                  <div className="h-6 w-40 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 w-24 bg-gray-300 rounded"></div>
                </div>
              ))}
            </>
          )}
          {activeTab === "locations" && (
            <>
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="bg-gray-200 animate-pulse p-4 rounded-lg"
                >
                  <div className="h-6 w-40 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 w-32 bg-gray-300 rounded"></div>
                </div>
              ))}
            </>
          )}
        </div>
      ) : (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {activeTab === "events" && (
            <>
            {events.length === 0 ? (
              <p className="text-center text-gray-500">Нет мероприятий</p>
            ) : (
              events.map((event) => (
                <motion.div
                  key={event.id}
                  className="bg-white shadow-md p-4 rounded-lg flex justify-between items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold">{event.title}</h2>
                    <p className="text-gray-600">
                      {new Date(event.start_time).toLocaleString()} -{" "}
                      {new Date(event.end_time).toLocaleString()}
                    </p>
                    <p className="text-gray-500">
                      Локация: {event.location?.name || "Не указано"}
                    </p>
                    <p className="text-gray-500">
                      Категория: {event.category?.name || "Не указано"}
                    </p>
                    <p className="text-gray-500">
                      Статус: {event.is_public ? "Публичное" : "Приватное"}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Автор: {event.author.username}
                    </p>
                  </div>
                  {isAuthenticated && (
                    <div className="flex space-x-4">
                      <motion.button
                        onClick={() => openEditModal(event)}
                        className="text-blue-500 hover:text-blue-700"
                        whileHover={{ scale: 1.1 }}
                      >
                        Редактировать
                      </motion.button>
                      <motion.button
                        onClick={() => openDeleteConfirmModal(event)}
                        className="text-red-500 hover:text-red-700"
                        whileHover={{ scale: 1.1 }}
                      >
                        Удалить
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              ))
            )}
            </>
          )}

          {activeTab === "categories" && (
            <>
              {categories.length === 0 ? (
                <p className="text-center text-gray-500">Нет категорий</p>
              ) : (
                categories.map((category) => (
                  <motion.div
                    key={category.id}
                    className="bg-white shadow-md p-4 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-xl font-semibold">{category.name}</h2>
                    <p className="text-gray-500">Slug: {category.slug}</p>
                  </motion.div>
                ))
              )}
            </>
          )}

          {activeTab === "locations" && (
            <>
              {locations.length === 0 ? (
                <p className="text-center text-gray-500">Нет локаций</p>
              ) : (
                locations.map((location) => (
                  <motion.div
                    key={location.id}
                    className="bg-white shadow-md p-4 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-xl font-semibold">{location.name}</h2>
                    <p className="text-gray-500">Город: {location.city || "Не указано"}</p>
                  </motion.div>
                ))
              )}
            </>
          )}
        </motion.div>
      )}

      <CreateEventForm
        onEventCreated={handleEventCreated}
        eventToEdit={eventToEdit}
        onEventUpdated={handleEventUpdated}
        onClose={closeEventModal}
        isOpen={isEventModalOpen}
      />

      <CreateLocationForm
        onLocationCreated={handleLocationCreated}
        onClose={closeLocationModal}
        isOpen={isLocationModalOpen}
      />

      <CreateCategoryForm
        onCategoryCreated={handleCategoryCreated}
        onClose={closeCategoryModal}
        isOpen={isCategoryModalOpen}
      />

      <DeleteConfirmModal
        isOpen={isDeleteConfirmModalOpen}
        onClose={closeDeleteConfirmModal}
        onConfirm={handleEventDeleted}
        eventToDelete={eventToDelete}
      />
    </div>
  );
};

export default EventsPage;