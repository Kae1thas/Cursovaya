import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const HomePage = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("token");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500); // Имитация загрузки
  }, []);

  return (
    <div className="flex items-center justify-center h-full bg-gray-100 p-6">
      {loading ? (
        <div className="max-w-2xl w-full space-y-4">
          <div className="bg-gray-200 animate-pulse rounded-lg p-6 text-center">
            <div className="h-10 w-64 bg-gray-300 rounded mx-auto mb-4"></div>
            <div className="h-6 w-96 bg-gray-300 rounded mx-auto mb-8"></div>
            <div className="flex justify-center space-x-4">
              <div className="h-10 w-32 bg-gray-300 rounded"></div>
              {!isAuthenticated && (
                <>
                  <div className="h-10 w-32 bg-gray-300 rounded"></div>
                  <div className="h-10 w-32 bg-gray-300 rounded"></div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Добро пожаловать в Event Manager
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Организуйте свои мероприятия, управляйте категориями и локациями в одном месте.
          </p>
          <div className="flex justify-center space-x-4">
            <motion.button
              onClick={() => navigate("/events")}
              className="bg-green-500 text-white py-2 px-6 rounded-md hover:bg-green-600 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              К мероприятиям
            </motion.button>
            {!isAuthenticated && (
              <>
                <motion.button
                  onClick={() => navigate("/login")}
                  className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  Войти
                </motion.button>
                <motion.button
                  onClick={() => navigate("/register")}
                  className="bg-purple-500 text-white py-2 px-6 rounded-md hover:bg-purple-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  Зарегистрироваться
                </motion.button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default HomePage;