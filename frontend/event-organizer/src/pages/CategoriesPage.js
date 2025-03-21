import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import CreateCategoryForm from "../components/CreateCategoryForm";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { motion } from "framer-motion";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/api/categories/", {
          headers: { Authorization: `Token ${token}` },
        });
        setCategories(response.data);
      } catch (error) {
        console.error("Ошибка загрузки категорий:", error);
        toast.error("Ошибка при загрузке категорий.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryCreated = (newCategory) => {
    setCategories((prev) => [...prev, newCategory]);
    toast.success("Категория создана!");
    setIsModalOpen(false);
  };

  const handleCategoryUpdated = (updatedCategory) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat))
    );
    toast.success("Категория обновлена!");
    setIsModalOpen(false);
    setCategoryToEdit(null);
  };

  const handleCategoryDeleted = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:8000/api/categories/${categoryToDelete.id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryToDelete.id));
      toast.success("Категория удалена.");
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error("Ошибка при удалении категории:", error);
      toast.error("Ошибка при удалении категории.");
      setIsDeleteModalOpen(false);
    }
  };

  const openEditModal = (category) => {
    setCategoryToEdit(category);
    setIsModalOpen(true);
  };

  return (
    <div className="h-full max-w-4xl mx-auto p-6 overflow-y-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Категории</h1>
      <motion.button
        onClick={() => setIsModalOpen(true)}
        className="bg-purple-500 text-white py-2 px-6 rounded-md mb-6 hover:bg-purple-600 transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Добавить категорию
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
                <div className="h-4 w-24 bg-gray-300 rounded"></div>
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
          {categories.length === 0 ? (
            <p className="text-center text-gray-500">Нет категорий</p>
          ) : (
            categories.map((category) => (
              <motion.div
                key={category.id}
                className="bg-white shadow-md p-4 rounded-lg flex justify-between items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <h2 className="text-xl font-semibold">{category.name}</h2>
                  <p className="text-gray-500">Slug: {category.slug}</p>
                </div>
                <div className="flex space-x-4">
                  <motion.button
                    onClick={() => openEditModal(category)}
                    className="text-blue-500 hover:text-blue-700"
                    whileHover={{ scale: 1.1 }}
                  >
                    Редактировать
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setCategoryToDelete(category);
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
      <CreateCategoryForm
        onCategoryCreated={handleCategoryCreated}
        onCategoryUpdated={handleCategoryUpdated}
        categoryToEdit={categoryToEdit}
        onClose={() => {
          setIsModalOpen(false);
          setCategoryToEdit(null);
        }}
        isOpen={isModalOpen}
      />
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleCategoryDeleted}
        itemToDelete={categoryToDelete}
      />
    </div>
  );
};

export default CategoriesPage;