// ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />; // Если нет пользователя, перенаправляем на страницу логина
  }

  return children;  // Если пользователь авторизован, показываем контент
}

export default ProtectedRoute;
