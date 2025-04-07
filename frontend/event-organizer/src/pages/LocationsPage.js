import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import CreateLocationForm from "../components/CreateLocationForm";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { motion } from "framer-motion";

const LocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [locationToEdit, setLocationToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/api/locations/", {
          headers: { Authorization: `Token ${token}` },
        });
        setLocations(response.data);
      } catch (error) {
        console.error("Ошибка загрузки локаций:", error);
        toast.error("Ошибка при загрузке локаций.");
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  const handleLocationCreated = (newLocation) => {
    setLocations((prev) => [...prev, newLocation]);
    toast.success("Локация создана!");
    setIsModalOpen(false);
  };

  const handleLocationUpdated = (updatedLocation) => {
    setLocations((prev) =>
      prev.map((loc) => (loc.id === updatedLocation.id ? updatedLocation : loc))
    );
    toast.success("Локация обновлена!");
    setIsModalOpen(false);
    setLocationToEdit(null);
  };

  const handleLocationDeleted = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:8000/api/locations/${locationToDelete.id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setLocations((prev) => prev.filter((loc) => loc.id !== locationToDelete.id));
      toast.success("Локация удалена.");
      setIsDeleteModalOpen(false);
      setLocationToDelete(null);
    } catch (error) {
      console.error("Ошибка при удалении локации:", error);
      toast.error("Ошибка при удалении локации.");
      setIsDeleteModalOpen(false);
    }
  };

  const openEditModal = (location) => {
    setLocationToEdit(location);
    setIsModalOpen(true);
  };

  return (
    <div className="h-full max-w-4xl mx-auto p-6 overflow-y-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Локации</h1>
      <motion.button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 text-white py-2 px-6 rounded-md mb-6 hover:bg-blue-600 transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Добавить локацию
      </motion.button>
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="bg-gray-200 animate-pulse p-4 rounded-lg flex justify-between items-center"
            >
              <div className="space-y-2">
                <div className="h-6 w-40 bg-gray-300 rounded"></div>
                <div className="h-4 w-32 bg-gray-300 rounded"></div>
                <div className="h-4 w-48 bg-gray-300 rounded"></div>
              </div>
              <div className="flex space-x-4">
                <div className="h-6 w-20 bg-gray-300 rounded"></div>
                <div className="h-6 w-20 bg-gray-300 rounded"></div>
              </div>
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
          {locations.length === 0 ? (
            <p className="text-center text-gray-500">Нет локаций</p>
          ) : (
            locations.map((location) => (
              <motion.div
                key={location.id}
                className="bg-white shadow-md p-4 rounded-lg flex justify-between items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <h2 className="text-xl font-semibold">{location.name}</h2>
                  <p className="text-gray-500">Город: {location.city || "Не указано"}</p>
                  <p className="text-gray-500">Адрес: {location.address || "Не указано"}</p>
                  <p className="text-gray-500">Вместимость: {location.capacity || "Не указано"}</p>
                </div>
                <div className="flex space-x-4">
                  <motion.button
                    onClick={() => openEditModal(location)}
                    className="text-blue-500 hover:text-blue-700"
                    whileHover={{ scale: 1.1 }}
                  >
                    Редактировать
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setLocationToDelete(location);
                      setIsDeleteModalOpen(true);
                    }}
                    className="text-red-500 hover:text-red-700"
                    whileHover={{ scale: 1.1 }}
                  >
                    Удалить
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}
      <CreateLocationForm
        onLocationCreated={handleLocationCreated}
        onLocationUpdated={handleLocationUpdated}
        locationToEdit={locationToEdit}
        onClose={() => {
          setIsModalOpen(false);
          setLocationToEdit(null);
        }}
        isOpen={isModalOpen}
      />
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleLocationDeleted}
        itemToDelete={locationToDelete}
      />
    </div>
  );
};

export default LocationsPage;