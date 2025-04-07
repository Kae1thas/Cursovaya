import React, { useState, useEffect } from "react";
import axiosClient, { getUserRole } from "../api/axiosClient";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userRole = await getUserRole();
        setRole(userRole);
        if (userRole !== "admin") {
          toast.error("Доступ только для админов!");
          return;
        }
        const response = await axiosClient.get("/users/");
        console.log("API response:", response.data);
        setUsers(response.data);
      } catch (error) {
        console.error("Ошибка загрузки пользователей:", error);
        toast.error("Ошибка при загрузке пользователей.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axiosClient.patch(`/users/${userId}/update-role/`, { role: newRole });
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, profile: { ...user.profile, role: newRole } } : user
        )
      );
      toast.success(`Роль изменена на ${newRole}!`);
    } catch (error) {
      console.error("Ошибка обновления роли:", error);
      toast.error("Ошибка при обновлении роли.");
    }
  };

  if (role !== "admin") {
    return <p className="text-center text-red-500">Доступ запрещён</p>;
  }

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
                  <th className="p-3 text-left">Действия</th>
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
                    <td className="p-3">
                      <select
                        value={user.profile?.role || "user"}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="border rounded-md p-1"
                      >
                        <option value="user">Пользователь</option>
                        <option value="moderator">Модератор</option>
                        <option value="admin">Админ</option>
                      </select>
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