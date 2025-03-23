// src/pages/UsersPage.js
import React, { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get("/users/");
        console.log("API response:", response.data); // Логируем ответ для отладки
        setUsers(response.data);
      } catch (error) {
        console.error("Ошибка загрузки пользователей:", error);
        toast.error("Ошибка при загрузке пользователей.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6"
    >
      <h1 className="text-3xl font-bold text-center mb-8">Пользователи</h1>
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
        <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          {users.length === 0 ? (
            <p className="text-center text-gray-500">Нет пользователей</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left">Имя</th>
                  <th className="p-3 text-left">Почта</th>
                  <th className="p-3 text-left">Дата регистрации</th>
                  <th className="p-3 text-left">Роль</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="p-3">{user.username}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">
                      {new Date(user.date_joined).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      {user.profile && user.profile.role ? user.profile.role : "Не указана"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default UsersPage;