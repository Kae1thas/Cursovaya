import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";  // Добавлен AnimatePresence
import LoginPage from "./pages/LoginPage";
import EventsPage from "./pages/EventsPage";

const AppRouter = () => {
  const location = useLocation();

  return (
    <AnimatePresence> {/* Оборачиваем Routes в AnimatePresence */}
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <LoginPage />
            </motion.div>
          }
        />
        <Route
          path="/events"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <EventsPage />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRouter;
