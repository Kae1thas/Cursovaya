import React, { useEffect, useState } from "react";
import axios from "axios";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [alert, setAlert] = useState(null);
  const [formErrors, setFormErrors] = useState({
    startTimeError: null,
    endTimeError: null,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  // Получение токена из localStorage
  const token = localStorage.getItem("access_token");

  // Функция для загрузки списка событий
  useEffect(() => {
    if (token) {
      axios.get("http://localhost:8000/api/events/", {
        headers: {
          Authorization: `Bearer ${token}`, // Передаем токен в заголовке
        },
      })
        .then(response => setEvents(response.data))
        .catch(error => console.error("Ошибка загрузки событий:", error));
    }
  }, [token]);

  const openCreateModal = () => {
    setSelectedEvent(null);
    setNewEvent({
      title: "",
      description: "",
      start_time: "",
      end_time: "",
    });
    setShowModal(true);
  };

  const openEditModal = (event) => {
    setSelectedEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description,
      start_time: new Date(event.start_time).toISOString().slice(0, 16),
      end_time: new Date(event.end_time).toISOString().slice(0, 16),
    });
    setShowModal(true);
  };

  const validateDates = () => {
    const startTime = new Date(newEvent.start_time);
    const endTime = new Date(newEvent.end_time);
    const currentYear = new Date().getFullYear();
    const startYear = startTime.getFullYear();
    const endYear = endTime.getFullYear();
    let isValid = true;

    let startTimeError = null;
    let endTimeError = null;

    if (startYear < 1000 || startYear > currentYear + 100) {
      startTimeError = "Год начала должен быть корректным.";
      isValid = false;
    }

    if (endYear < 1000 || endYear > currentYear + 100) {
      endTimeError = "Год окончания должен быть корректным.";
      isValid = false;
    }

    if (startTime >= endTime) {
      endTimeError = "Дата окончания должна быть позже даты начала.";
      isValid = false;
    }

    setFormErrors({ startTimeError, endTimeError });
    return isValid;
  };

  const handleCreateEvent = () => {
    if (!validateDates()) {
      return;
    }

    const start_time = newEvent.start_time ? new Date(newEvent.start_time).toISOString().slice(0, 16) : "";
    const end_time = newEvent.end_time ? new Date(newEvent.end_time).toISOString().slice(0, 16) : "";

    if (!start_time || !end_time) {
      setAlert({ message: "Пожалуйста, заполните обе даты!", type: "danger" });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    const eventData = { ...newEvent, start_time, end_time };

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    if (selectedEvent) {
      axios.put(`http://localhost:8000/api/events/${selectedEvent.id}/`, eventData, { headers })
        .then(response => {
          setEvents(events.map(event => event.id === selectedEvent.id ? response.data : event));
          setShowModal(false);
          setAlert({ message: "Мероприятие обновлено успешно!", type: "success" });
          setTimeout(() => setAlert(null), 3000);
        })
        .catch(error => {
          setAlert({ message: "Ошибка при обновлении мероприятия.", type: "danger" });
          setTimeout(() => setAlert(null), 3000);
        });
    } else {
      axios.post("http://localhost:8000/api/events/", eventData, { headers })
        .then(response => {
          setEvents([...events, response.data]);
          setShowModal(false);
          setAlert({ message: "Мероприятие добавлено успешно!", type: "success" });
          setTimeout(() => setAlert(null), 3000);
        })
        .catch(error => {
          setAlert({ message: "Ошибка при создании мероприятия.", type: "danger" });
          setTimeout(() => setAlert(null), 3000);
        });
    }
  };

  const handleDeleteEvent = () => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    axios.delete(`http://localhost:8000/api/events/${eventToDelete.id}/`, { headers })
      .then(() => {
        setEvents(events.filter(event => event.id !== eventToDelete.id));
        setAlert({ message: "Мероприятие удалено успешно!", type: "success" });
        setTimeout(() => setAlert(null), 3000);
        setShowDeleteConfirm(false);
      })
      .catch(error => {
        setAlert({ message: "Ошибка при удалении мероприятия.", type: "danger" });
        setTimeout(() => setAlert(null), 3000);
        setShowDeleteConfirm(false);
      });
  };

  const openDeleteConfirmModal = (event) => {
    setEventToDelete(event);
    setShowDeleteConfirm(true);
  };

  return (
    <div className="container">
      {/* Оповещения */}
      {alert && (
        <div className={`alert alert-${alert.type} fixed-top mt-3 mx-auto`} style={{ width: "fit-content", zIndex: 999 }} role="alert">
          {alert.message}
        </div>
      )}

      <h1 className="mb-4">Список мероприятий</h1>

      <button onClick={openCreateModal} className="btn btn-primary mb-3">
        Создать мероприятие
      </button>

      {/* Список карточек мероприятий */}
      <div className="row">
        {events.map(event => (
          <div key={event.id} className="col-md-4 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{event.title}</h5>
                <p className="card-text">{event.description}</p>
                <p className="card-text">
                  <small className="text-muted">Начало: {new Date(event.start_time).toLocaleString()}</small>
                </p>
                <p className="card-text">
                  <small className="text-muted">Окончание: {new Date(event.end_time).toLocaleString()}</small>
                </p>
                <button className="btn btn-warning" onClick={() => openEditModal(event)}>Редактировать</button>
                <button className="btn btn-danger ml-2" onClick={() => openDeleteConfirmModal(event)}>Удалить</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Модальное окно для подтверждения удаления */}
      {showDeleteConfirm && (
        <div className="modal fade show" style={{ display: "block", zIndex: 998 }} tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Подтверждение удаления</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => setShowDeleteConfirm(false)}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p>Вы уверены, что хотите удалить это мероприятие?</p>
                <button type="button" className="btn btn-danger" onClick={handleDeleteEvent}>Удалить</button>
                <button type="button" className="btn btn-secondary ml-2" onClick={() => setShowDeleteConfirm(false)}>Отмена</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для создания/редактирования мероприятия */}
      {showModal && (
        <div className="modal fade show" style={{ display: "block", zIndex: 998 }} tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedEvent ? "Редактировать мероприятие" : "Создать мероприятие"}</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => setShowModal(false)}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="form-group">
                    <label htmlFor="title">Название</label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      name="title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="description">Описание</label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="start_time">Дата начала</label>
                    <input
                      type="datetime-local"
                      className={`form-control ${formErrors.startTimeError ? "is-invalid" : ""}`}
                      id="start_time"
                      name="start_time"
                      value={newEvent.start_time}
                      onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                    />
                    {formErrors.startTimeError && <div className="invalid-feedback">{formErrors.startTimeError}</div>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="end_time">Дата окончания</label>
                    <input
                      type="datetime-local"
                      className={`form-control ${formErrors.endTimeError ? "is-invalid" : ""}`}
                      id="end_time"
                      name="end_time"
                      value={newEvent.end_time}
                      onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                    />
                    {formErrors.endTimeError && <div className="invalid-feedback">{formErrors.endTimeError}</div>}
                  </div>
                  <button type="button" className="btn btn-primary" onClick={handleCreateEvent}>Создать</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventList;
