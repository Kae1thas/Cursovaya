import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

// Создаём контекст для авторизации
const AuthContext = createContext();

// Хук для использования контекста
export const useAuth = () => {
  return useContext(AuthContext);
};

// Провайдер контекста
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Функция для логина
  const login = (username, password) => {
    axios.post('http://localhost:8000/api/token/', { username, password })
      .then(response => {
        const { access, refresh } = response.data;
        localStorage.setItem('access_token', access); // Сохраняем токен в localStorage
        setUser({ username });
      })
      .catch(error => {
        console.error("Ошибка авторизации:", error);
      });
  };

  // Функция для логаута
  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
