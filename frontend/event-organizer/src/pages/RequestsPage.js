import React, { useState, useEffect } from "react";
import axiosClient, { getUserRole } from "../api/axiosClient";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const RequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [eventDetails, setEventDetails] = useState({});
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);

  const translateStatus = (status) => {
    switch (status) {
      case "pending":
        return "На рассмотрении";
      case "approved":
        return "Одобрено";
      case "rejected":
        return "Отклонено";
      default:
        return status;
    }
  };

  const translateAction = (action) => {
    switch (action) {
      case "create":
        return "Создание";
      case "update":
        return "Редактирование";
      case "delete":
        return "Удаление";
      default:
        return action;
    }
  };

  const fetchEventDetails = async (eventId) => {
    try {
      const response = await axiosClient.get(`/events/${eventId}/`);
      setEventDetails((prev) => ({ ...prev, [eventId]: response.data }));
    } catch (error) {
      console.error("Ошибка загрузки мероприятия:", error);
      toast.error("Не удалось загрузить детали мероприятия.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userRole = await getUserRole();
        console.log("Role:", userRole);
        setRole(userRole);

        const [requestsResponse, locationsResponse, categoriesResponse] = await Promise.all([
          axiosClient.get("/requests/"),
          axiosClient.get("/locations/"),
          axiosClient.get("/categories/"),
        ]);

        const filteredRequests =
          userRole === "moderator"
            ? requestsResponse.data.filter((req) => req.status === "pending")
            : requestsResponse.data;
        setRequests(filteredRequests);
        setLocations(locationsResponse.data);
        setCategories(categoriesResponse.data);

        filteredRequests.forEach((req) => {
          if ((req.action === "update" || req.action === "delete") && req.event) {
            fetchEventDetails(req.event);
          }
        });
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        toast.error("Ошибка при загрузке данных.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAction = async (requestId, action) => {
    try {
      await axiosClient.patch(`/requests/${requestId}/`, { status: action });
      if (role === "moderator") {
        setRequests((prev) => prev.filter((req) => req.id !== requestId));
      } else if (role === "admin") {
        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId ? { ...req, status: action } : req
          )
        );
      }
      toast.success(`Заявка ${action === "approved" ? "одобрена" : "отклонена"}!`);
    } catch (error) {
      console.error("Ошибка при обновлении статуса:", error);
      toast.error("Ошибка при обработке заявки.");
    }
  };

  const toggleDetails = (requestId) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
  };

  const getLocationName = (id) => {
    const location = locations.find((loc) => loc.id === id);
    return location ? location.name : "Не выбрана";
  };

  const getCategoryName = (id) => {
    const category = categories.find((cat) => cat.id === id);
    return category ? category.name : "Не выбрана";
  };

  const renderRequestDetails = (request) => {
    if (request.request_type === "event") {
      if (request.action === "create") {
        return (
          <div className="mt-4 text-gray-700">
            <h3 className="font-semibold text-lg mb-2">Детали создания:</h3>
            <ul className="space-y-1">
              <li><span className="font-medium">Название:</span> {request.data.title || "Не указано"}</li>
              <li><span className="font-medium">Описание:</span> {request.data.description || "Без описания"}</li>
              <li>
                <span className="font-medium">Начало:</span>{" "}
                {request.data.start_time ? new Date(request.data.start_time).toLocaleString() : "Не указано"}
              </li>
              <li>
                <span className="font-medium">Окончание:</span>{" "}
                {request.data.end_time ? new Date(request.data.end_time).toLocaleString() : "Не указано"}
              </li>
              <li><span className="font-medium">Локация:</span> {getLocationName(request.data.location_id)}</li>
              <li><span className="font-medium">Категория:</span> {getCategoryName(request.data.category_id)}</li>
              <li><span className="font-medium">Публичное:</span> {request.data.is_public ? "Да" : "Нет"}</li>
            </ul>
          </div>
        );
      } else if (request.action === "update") {
        const currentEvent = eventDetails[request.event];
        return (
          <div className="mt-4 text-gray-700">
            <h3 className="font-semibold text-lg mb-2">Детали редактирования:</h3>
            <p className="mb-2">Мероприятие ID: {request.event || "Не указано"}</p>
            {currentEvent ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <h4 className="font-medium text-gray-500">Текущее</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>Название: {currentEvent.title}</li>
                    <li>Описание: {currentEvent.description || "Без описания"}</li>
                    <li>Начало: {new Date(currentEvent.start_time).toLocaleString()}</li>
                    <li>Окончание: {new Date(currentEvent.end_time).toLocaleString()}</li>
                    <li>Локация: {getLocationName(currentEvent.location?.id)}</li>
                    <li>Категория: {getCategoryName(currentEvent.category?.id)}</li>
                    <li>Публичное: {currentEvent.is_public ? "Да" : "Нет"}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-green-600">Новое</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>Название: {request.data.title || currentEvent.title}</li>
                    <li>Описание: {request.data.description || currentEvent.description || "Без описания"}</li>
                    <li>
                      Начало:{" "}
                      {request.data.start_time
                        ? new Date(request.data.start_time).toLocaleString()
                        : new Date(currentEvent.start_time).toLocaleString()}
                    </li>
                    <li>
                      Окончание:{" "}
                      {request.data.end_time
                        ? new Date(request.data.end_time).toLocaleString()
                        : new Date(currentEvent.end_time).toLocaleString()}
                    </li>
                    <li>
                      Локация:{" "}
                      {request.data.location_id != null
                        ? getLocationName(Number(request.data.location_id))
                        : getLocationName(currentEvent.location?.id)}
                    </li>
                    <li>
                      Категория:{" "}
                      {request.data.category_id != null
                        ? getCategoryName(Number(request.data.category_id))
                        : getCategoryName(currentEvent.category?.id)}
                    </li>
                    <li>
                      Публичное:{" "}
                      {request.data.hasOwnProperty("is_public")
                        ? request.data.is_public
                          ? "Да"
                          : "Нет"
                        : currentEvent.is_public
                        ? "Да"
                        : "Нет"}
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <p>Загрузка данных мероприятия...</p>
            )}
          </div>
        );
      } else if (request.action === "delete") {
        const currentEvent = eventDetails[request.event];
        return (
          <div className="mt-4 text-gray-700">
            <h3 className="font-semibold text-lg mb-2">Детали удаления:</h3>
            <p className="mb-2">Мероприятие ID: {request.event || "Не указано"}</p>
            {currentEvent ? (
              <ul className="space-y-1">
                <li><span className="font-medium">Название:</span> {currentEvent.title}</li>
                <li><span className="font-medium">Описание:</span> {currentEvent.description || "Без описания"}</li>
                <li><span className="font-medium">Начало:</span> {new Date(currentEvent.start_time).toLocaleString()}</li>
                <li><span className="font-medium">Окончание:</span> {new Date(currentEvent.end_time).toLocaleString()}</li>
                <li><span className="font-medium">Локация:</span> {getLocationName(currentEvent.location?.id)}</li>
                <li><span className="font-medium">Категория:</span> {getCategoryName(currentEvent.category?.id)}</li>
                <li><span className="font-medium">Публичное:</span> {currentEvent.is_public ? "Да" : "Нет"}</li>
              </ul>
            ) : (
              <p>Загрузка данных мероприятия...</p>
            )}
          </div>
        );
      }
    } else if (request.request_type === "location") {
      return (
        <div className="mt-4 text-gray-700">
          <h3 className="font-semibold text-lg mb-2">Детали локации:</h3>
          <ul className="space-y-1">
            <li><span className="font-medium">Название:</span> {request.data.name || "Не указано"}</li>
            <li><span className="font-medium">Город:</span> {request.data.city || "Не указано"}</li>
          </ul>
        </div>
      );
    } else if (request.request_type === "category") {
      return (
        <div className="mt-4 text-gray-700">
          <h3 className="font-semibold text-lg mb-2">Детали категории:</h3>
          <ul className="space-y-1">
            <li><span className="font-medium">Название:</span> {request.data.name || "Не указано"}</li>
          </ul>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full max-w-4xl mx-auto p-6 overflow-y-auto">
      <h1 className="text-3xl font-bold text-center mb-8">
        {role === "user" ? "Мои заявки" : role === "moderator" ? "Ожидающие заявки" : "Все заявки"}
      </h1>
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-gray-200 animate-pulse p-4 rounded-lg">
              <div className="h-6 w-40 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 w-32 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {requests.length === 0 ? (
            <p className="text-center text-gray-500">Нет заявок</p>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="bg-white shadow-md p-4 rounded-lg"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {request.request_type === "event"
                        ? `Мероприятие: ${request.data.title || "Без названия"}`
                        : request.request_type === "location"
                        ? `Локация: ${request.data.name}`
                        : `Категория: ${request.data.name}`}
                    </h2>
                    <p className="text-gray-500">
                      Тип заявки: {translateAction(request.action)}
                    </p>
                    <p className="text-gray-500">
                      Статус: {role === "user" ? translateStatus(request.status) : request.status}
                    </p>
                    <p className="text-gray-500">
                      Создано: {new Date(request.created_at).toLocaleString()}
                    </p>
                    {(role === "moderator" || role === "admin") && (
                      <p className="text-gray-500">Автор: {request.user}</p>
                    )}
                    {(role === "admin" || role === "moderator") && request.reviewed_by && (
                      <p className="text-gray-500">
                        Обработано: {request.reviewed_by} в{" "}
                        {new Date(request.updated_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-4">
                    <motion.button
                      onClick={() => toggleDetails(request.id)}
                      className="text-blue-500 hover:text-blue-700"
                      whileHover={{ scale: 1.05 }}
                    >
                      {expandedRequest === request.id ? "Скрыть" : "Подробнее"}
                    </motion.button>
                    {(role === "moderator" || role === "admin") &&
                      request.status === "pending" && (
                        <>
                          <motion.button
                            onClick={() => handleAction(request.id, "approved")}
                            className="bg-green-500 text-white py-1 px-3 rounded-md hover:bg-green-600"
                            whileHover={{ scale: 1.05 }}
                          >
                            Одобрить
                          </motion.button>
                          <motion.button
                            onClick={() => handleAction(request.id, "rejected")}
                            className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600"
                            whileHover={{ scale: 1.05 }}
                          >
                            Отклонить
                          </motion.button>
                        </>
                      )}
                  </div>
                </div>
                {expandedRequest === request.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 border-t pt-2"
                  >
                    {renderRequestDetails(request)}
                  </motion.div>
                )}
              </div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
};

export default RequestsPage;