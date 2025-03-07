import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const CreateEventForm = ({ onEventCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [dateError, setDateError] = useState("");

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

      const response = await axios.post(
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

      toast.success("Мероприятие успешно создано!");
      console.log("Создано:", response.data);

      onEventCreated(response.data);

      setTitle("");
      setDescription("");
      setStartTime("");
      setEndTime("");
      setLocation("");
    } catch (error) {
      console.error("Ошибка создания:", error);
      toast.error("Ошибка при создании мероприятия.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6 flex flex-col">
      <h2 className="text-2xl font-semibold text-center mb-4">
        Создать мероприятие
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col w-full space-y-4">
        <div className="flex flex-col">
          <label className="text-gray-700">Название мероприятия*</label>
          <input
            type="text"
            className="mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700">Описание</label>
          <textarea
            className="mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 p-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700">Дата и время начала*</label>
          <input
            type="datetime-local"
            max="2100-12-31T23:59"
            className="mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 p-2"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700">Дата и время окончания*</label>
          <input
            type="datetime-local"
            max="2100-12-31T23:59"
            className="mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 p-2"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
          {dateError && <p className="text-red-500">{dateError}</p>}
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700">Место проведения</label>
          <input
            type="text"
            className="mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 p-2"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-md shadow-md hover:bg-blue-600 transition"
        >
          Создать мероприятие
        </button>
      </form>
    </div>
  );
};

export default CreateEventForm;
