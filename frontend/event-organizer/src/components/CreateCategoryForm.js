import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Modal from "react-modal";
import { motion } from "framer-motion";

const CreateCategoryForm = ({ onCategoryCreated, onClose, isOpen }) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://127.0.0.1:8000/api/categories/", {
          headers: { Authorization: `Token ${token}` },
        });
        setCategories(response.data);
      } catch (error) {
        console.error("Ошибка загрузки категорий:", error);
        toast.error("Не удалось загрузить категории.");
      }
    };
    if (isOpen) fetchCategories();
  }, [isOpen]);

  const generateUniqueSlug = (name) => {
    let baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    let newSlug = baseSlug;
    let counter = 1;

    while (categories.some((cat) => cat.slug === newSlug)) {
      newSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    return newSlug;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Название категории обязательно!");
      return;
    }

    const finalSlug = slug.trim() || generateUniqueSlug(name);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://127.0.0.1:8000/api/categories/",
        {
          name: name.trim(),
          slug: finalSlug,
        },
        { headers: { Authorization: `Token ${token}` } }
      );

      onCategoryCreated(response.data);
    } catch (error) {
      console.error("Ошибка создания категории:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.name || error.response?.data?.slug || "Неизвестная ошибка";
      toast.error(`Ошибка: ${errorMessage}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Create Category"
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
        <h2 className="text-2xl font-semibold text-center mb-6">Создать категорию</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Название *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <input
            type="text"
            placeholder="Slug (оставьте пустым для автозаполнения)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="bg-purple-500 text-white py-2 px-6 rounded-md hover:bg-purple-600 transition-colors"
            >
              Создать
            </button>
          </div>
        </form>
      </motion.div>
    </Modal>
  );
};

export default CreateCategoryForm;