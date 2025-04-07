import React from "react";
import AppRouter from "./AppRouter";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router } from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="h-screen">
        <Navbar />
        <main className="absolute top-16 bottom-16 left-0 right-0 overflow-y-auto">
          <AppRouter />
        </main>
        <Footer />
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </Router>
  );
}

export default App;