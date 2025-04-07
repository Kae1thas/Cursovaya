import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from "react-toastify"; // Добавляем toast для уведомлений

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/token/', {
        username,
        password,
      });

      const token = response.data.token;
      localStorage.setItem('token', token);
      localStorage.setItem("username", username); // Сохраняем введённый username
      console.log('Успешная авторизация, токен:', token, 'username:', username);

      toast.success("Вход выполнен успешно!");
      navigate('/');
    } catch (error) {
      console.error('Ошибка авторизации:', error.response?.data || error.message);
      toast.error("Ошибка при входе. Проверьте логин и пароль.");
    }
  };

  return (
    <div className="flex items-center justify-center h-full bg-gray-100 p-6">
      <motion.div
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-700">Вход</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <motion.input
            type="text"
            placeholder="Логин"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
          
          <motion.input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />
          
          <motion.button
            type="submit"
            className="w-full py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
          >
            Войти
          </motion.button>
          <div className="text-center mt-4">
            <p className="text-gray-600">
              Нет аккаунта?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-blue-500 hover:underline"
              >
                Зарегистрируйтесь
              </button>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;