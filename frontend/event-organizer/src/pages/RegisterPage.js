import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const RegisterPage = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/api/register/", {
        username,
        email,
        password,
        password2,
      });
      toast.success("Регистрация успешна! Теперь войдите.");
      navigate("/login");
    } catch (error) {
      console.error("Ошибка регистрации:", error.response?.data || error);
      toast.error("Ошибка регистрации. Проверьте данные.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-100 p-6">
      {loading ? (
        <div className="max-w-md w-full space-y-4">
          <div className="bg-gray-200 animate-pulse rounded-lg p-6">
            <div className="h-8 w-48 bg-gray-300 rounded mx-auto mb-6"></div>
            <div className="space-y-4">
              <div className="h-10 w-full bg-gray-300 rounded"></div>
              <div className="h-10 w-full bg-gray-300 rounded"></div>
              <div className="h-10 w-32 bg-gray-300 rounded mx-auto"></div>
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-white p-6 rounded-lg shadow-md"
        >
          <h1 className="text-2xl font-bold text-center mb-6">Регистрация</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
            <input
                type="text"
                placeholder="Имя пользователя"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
            <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
            <input
                type="password"
                placeholder="Подтвердите пароль"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
            <motion.button
                type="submit"
                className="w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition-colors"
                whileHover={{ scale: 1.05 }}
            >
                Зарегистрироваться
            </motion.button>
            <div className="text-center mt-4">
                <p className="text-gray-600">
                    Уже есть аккаунт?{" "}
                    <button
                        onClick={() => navigate("/login")}
                        className="text-blue-500 hover:underline"
                        >
                        Войдите
                    </button>
                </p>
            </div>
            </form>
        </motion.div>
      )}
    </div>
  );
};

export default RegisterPage;