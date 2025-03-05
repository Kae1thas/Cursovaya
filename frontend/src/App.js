import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import EventList from './EventList';
import LoginPage from './LoginPage';
import ProtectedRoute from './ProtectedRoute';

function App() {
  const { user, logout } = useAuth();

  return (
    <div className="App">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <a className="navbar-brand" href="#">Организация Мероприятий</a>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/">Главная</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/events">Мероприятия</Link>
            </li>
            {user ? (
              <li className="nav-item">
                <button className="btn btn-danger" onClick={logout}>Выйти</button>
              </li>
            ) : (
              <li className="nav-item">
                <Link className="nav-link" to="/login">Войти</Link>
              </li>
            )}
          </ul>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/events" element={<ProtectedRoute><EventList /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

function Home() {
  return <div>Главная страница</div>;
}

function AppWithRouter() {
  return (
    <AuthProvider>
      <Router>
        <App />
      </Router>
    </AuthProvider>
  );
}

export default AppWithRouter;
