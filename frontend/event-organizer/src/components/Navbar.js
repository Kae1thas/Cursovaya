import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getUserProfile } from "../api/axiosClient";

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("token");
  const [userProfile, setUserProfile] = useState({ role: null, username: null });

  useEffect(() => {
    if (isAuthenticated) {
      getUserProfile().then((profile) => setUserProfile(profile));
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed top-0 left-0 w-full bg-gray-800 text-white p-4 flex justify-between items-center z-50 shadow-md"
    >
      <div className="text-xl font-bold">
        Event Manager {isAuthenticated && userProfile.username && `(${userProfile.username} - ${userProfile.role})`}
      </div>
      <div className="space-x-4">
        <button onClick={() => navigate("/")} className="hover:text-gray-300 transition-colors">
          Главная
        </button>
        {isAuthenticated && (
          <>
            <button onClick={() => navigate("/events")} className="hover:text-gray-300 transition-colors">
              Мероприятия
            </button>
            {userProfile.role === 'user' && (
              <button onClick={() => navigate("/requests")} className="hover:text-gray-300 transition-colors">
                Мои заявки
              </button>
            )}
            {(userProfile.role === 'moderator' || userProfile.role === 'admin') && (
              <>
                <button onClick={() => navigate("/categories")} className="hover:text-gray-300 transition-colors">
                  Категории
                </button>
                <button onClick={() => navigate("/locations")} className="hover:text-gray-300 transition-colors">
                  Локации
                </button>
                <button onClick={() => navigate("/requests")} className="hover:text-gray-300 transition-colors">
                  Заявки
                </button>
              </>
            )}
            {userProfile.role === 'admin' && (
              <button onClick={() => navigate("/users")} className="hover:text-gray-300 transition-colors">
                Пользователи
              </button>
            )}
            <button onClick={handleLogout} className="hover:text-gray-300 transition-colors">
              Выйти
            </button>
          </>
        )}
        {!isAuthenticated && (
          <button onClick={() => navigate("/login")} className="hover:text-gray-300 transition-colors">
            Войти
          </button>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;