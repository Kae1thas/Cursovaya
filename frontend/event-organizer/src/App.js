import React from "react";
import AppRouter from "./AppRouter";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router } from "react-router-dom"; // Обернули всё в Router

function App() {
  return (
    <Router> {/* Оборачиваем весь контент в Router */}
      <AppRouter /> {/* Теперь AppRouter находится внутри Router */}
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;
