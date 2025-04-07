import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Modal from "react-modal";
import { motion } from "framer-motion";

// Функция транслитерации
const transliterate = (text) => {
  const ruToEn = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i",
    й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t",
    у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y",
    ь: "", э: "e", ю: "yu", я: "ya",
    А: "A", Б: "B", В: "V", Г: "G", Д: "D", Е: "E", Ё: "E", Ж: "Zh", З: "Z", И: "I",
    Й: "Y", К: "K", Л: "L", М: "M", Н: "N", О: "O", П: "P", Р: "R", С: "S", Т: "T",
    У: "U", Ф: "F", Х: "Kh", Ц: "Ts", Ч: "Ch", Ш: "Sh", Щ: "Sch", Ъ: "", Ы: "Y",
    Ь: "", Э: "E", Ю: "Yu", Я: "Ya",
  };

  return text
    .split("")
    .map((char) => ruToEn[char] || char)
    .join("");
};

const CreateCategoryForm = ({ onCategoryCreated, onCategoryUpdated, categoryToEdit, onClose, isOpen }) => {
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

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setSlug(categoryToEdit.slug);
    } else {
      setName("");
      setSlug("");
    }
  }, [categoryToEdit]);

  const generateUniqueSlug = (name) => {
    // Транслитерируем русские буквы и приводим к нижнему регистру
    let baseSlug = transliterate(name.toLowerCase())
      .replace(/[^a-z0-9]+/g, "-") // Удаляем все, кроме букв и цифр, заменяем на "-"
      .replace(/(^-|-$)/g, ""); // Удаляем дефисы в начале и конце
    let newSlug = baseSlug || "category"; // Если слаг пустой, используем "category"
    let counter = 1;

    while (categories.some((cat) => cat.slug === newSlug && cat.id !== (categoryToEdit?.id || 0))) {
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
      const data = { name: name.trim(), slug: finalSlug };

      const response = categoryToEdit
        ? await axios.put(
            `http://127.0.0.1:8000/api/categories/${categoryToEdit.id}/`,
            data,
            { headers: { Authorization: `Token ${token}` } }
          )
        : await axios.post(
            "http://127.0.0.1:8000/api/categories/",
            data,
            { headers: { Authorization: `Token ${token}` } }
          );

      categoryToEdit ? onCategoryUpdated(response.data) : onCategoryCreated(response.data);
    } catch (error) {
      console.error("Ошибка:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.name || error.response?.data?.slug || "Неизвестная ошибка";
      toast.error(`Ошибка: ${errorMessage}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Create or Edit Category"
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
          {categoryToEdit ? "Редактировать категорию" : "Создать категорию"}
        </h2>
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
              {categoryToEdit ? "Обновить" : "Создать"}
            </button>
          </div>
        </form>
      </motion.div>
    </Modal>
  );
};

export default CreateCategoryForm;