import React, { useState, useEffect } from "react";
import axiosClient, { getUserRole } from "../api/axiosClient";
import { toast } from "react-toastify";
import CreateEventForm from "../components/CreateEventForm";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import CreateLocationForm from "../components/CreateLocationForm";
import CreateCategoryForm from "../components/CreateCategoryForm";
import RequestForm from "../components/RequestForm";
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
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestType, setRequestType] = useState(null);
  const [requestAction, setRequestAction] = useState("create");
  const [activeTab, setActiveTab] = useState("events");
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("token");

  const fetchEvents = async () => {
    try {
      const eventsResponse = isAuthenticated
        ? await axiosClient.get("/events/")
        : await axiosClient.get("/public-events/");
      setEvents(eventsResponse.data);
    } catch (error) {
      console.error("Ошибка загрузки событий:", error);
      toast.error("Ошибка при загрузке событий.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let userRole = null;
        if (isAuthenticated) {
          userRole = await getUserRole();
          setRole(userRole);
        }

        let eventsResponse;
        if (isAuthenticated) {
          const [eventsRes, categoriesRes, locationsRes] = await Promise.all([
            axiosClient.get("/events/"),
            axiosClient.get("/categories/"),
            axiosClient.get("/locations/"),
          ]);
          eventsResponse = eventsRes;
          setCategories(categoriesRes.data);
          setLocations(locationsRes.data);
        } else {
          eventsResponse = await axiosClient.get("/public-events/");
          setCategories([]);
          setLocations([]);
        }
        setEvents(eventsResponse.data);
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        toast.error("Ошибка при загрузке данных.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

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
      await axiosClient.delete(`/events/${eventToDelete.id}/`);
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

  const openRequestModal = (type, action = "create", event = null) => {
    setRequestType(type);
    setRequestAction(action);
    setEventToEdit(event);
    setIsRequestModalOpen(true);
  };

  const closeRequestModal = () => {
    setRequestType(null);
    setRequestAction("create");
    setEventToEdit(null);
    setIsRequestModalOpen(false);
    fetchEvents(); 
  };

  return (
    <div className="h-full max-w-4xl mx-auto p-6 overflow-y-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Управление мероприятиями</h1>

      {isAuthenticated && (
        <div className="flex space-x-4 mb-6">
          {(role === "moderator" || role === "admin") && (
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
          {role === "user" && (
            <>
              <motion.button
                onClick={() => openRequestModal("event", "create")}
                className="bg-green-500 text-white py-2 px-6 rounded-md hover:bg-green-600 transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                Заявка на мероприятие
              </motion.button>
              <motion.button
                onClick={() => openRequestModal("location")}
                className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Заявка на локацию
              </motion.button>
              <motion.button
                onClick={() => openRequestModal("category")}
                className="bg-purple-500 text-white py-2 px-6 rounded-md hover:bg-purple-600 transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Заявка на категорию
              </motion.button>
            </>
          )}
        </div>
      )}

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("events")}
          className={`py-2 px-4 rounded-md ${activeTab === "events" ? "bg-gray-200" : "bg-gray-100"}`}
        >
          Мероприятия
        </button>
        <button
          onClick={() => {
            if (!isAuthenticated) {
              toast.info("Пожалуйста, войдите для просмотра локаций.");
              navigate("/login");
            } else {
              setActiveTab("locations");
            }
          }}
          className={`py-2 px-4 rounded-md ${activeTab === "locations" ? "bg-gray-200" : "bg-gray-100"}`}
        >
          Локации
        </button>
        <button
          onClick={() => {
            if (!isAuthenticated) {
              toast.info("Пожалуйста, войдите для просмотра категорий.");
              navigate("/login");
            } else {
              setActiveTab("categories");
            }
          }}
          className={`py-2 px-4 rounded-md ${activeTab === "categories" ? "bg-gray-200" : "bg-gray-100"}`}
        >
          Категории
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
                <div key={index} className="bg-gray-200 animate-pulse p-4 rounded-lg">
                  <div className="h-6 w-40 bg-gray-300 rounded mb-2"></div>
                </div>
              ))}
            </>
          )}
          {activeTab === "locations" && (
            <>
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-gray-200 animate-pulse p-4 rounded-lg">
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
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-1">
                      <h2 className="text-xl font-semibold">{event.title}</h2>
                      <p className="text-gray-600">
                        {new Date(event.start_time).toLocaleString()} -{" "}
                        {new Date(event.end_time).toLocaleString()}
                      </p>
                      <p className="text-gray-500">
                        Локация: {event.location?.name || "Не указано"}{" "}
                        {event.location?.capacity ? `(Вместимость: ${event.location.capacity})` : ""}
                      </p>
                      <p className="text-gray-500">
                        Категория: {event.category?.name || "Не указано"}
                      </p>
                      <p className="text-gray-500">
                        Статус: {event.is_public ? "Публичное" : "Приватное"}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Автор: {event.author?.username || "Неизвестно"}
                      </p>
                    </div>
                    {isAuthenticated && (
                      <div className="flex space-x-4">
                        {(role === "moderator" || role === "admin") && (
                          <>
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
                          </>
                        )}
                        {role === "user" && (
                          <>
                            {event.author?.username === localStorage.getItem("username") && (
                              <>
                                <motion.button
                                  onClick={() => openRequestModal("event", "update", event)}
                                  className="text-yellow-500 hover:text-yellow-700"
                                  whileHover={{ scale: 1.1 }}
                                >
                                  Редактировать
                                </motion.button>
                                <motion.button
                                  onClick={() => openRequestModal("event", "delete", event)}
                                  className="text-red-500 hover:text-red-700"
                                  whileHover={{ scale: 1.1 }}
                                >
                                  Удалить
                                </motion.button>
                              </>
                            )}
                          </>
                        )}
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
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-xl font-semibold">{category.name}</h2>
                    {role && (role === "moderator" || role === "admin") && (
                      <p className="text-gray-500">Slug: {category.slug}</p>
                    )}
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
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-xl font-semibold">{location.name}</h2>
                    <p className="text-gray-500">Город: {location.city || "Не указано"}</p>
                    <p className="text-gray-500">Вместимость: {location.capacity || "Не указано"}</p>
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

      <RequestForm
        requestType={requestType}
        action={requestAction}
        eventToEdit={eventToEdit}
        isOpen={isRequestModalOpen}
        onClose={closeRequestModal}
      />
    </div>
  );
};

export default EventsPage;