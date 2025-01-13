/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';
import Footer from './components/Footer';

const App = () => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  const handleLogin = () => {
    setRole(localStorage.getItem('role'));
  };

  const handleLogout = () => {
    setRole(null);
    localStorage.removeItem('role');
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <Header />
      <Routes>
        <Route
          path="/"
          element={role ? <Home role={role} onLogout={handleLogout} /> : <Login onLogin={handleLogin} />}
        />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
