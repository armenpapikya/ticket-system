/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header';
import Login from './components/Login';
import Home from './components/Home';
import Register from './components/Register';
import AdminPanel from './components/AdminPanel';
import Profile from './components/Profile';
import TicketFrom from './components/TicketForm';
import Footer from './components/Footer';
import TicketList from './components/TicketList';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" />;
    if (requiredRole && user.role !== requiredRole) return <Navigate to="/" />;
    
    return children;
};

const App = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setUser({
                username: localStorage.getItem('username'),
                role: localStorage.getItem('role')
            });
        }
    }, []);

    const login = (role) => {
        setUser({
            username: localStorage.getItem('username'),
            role
        });
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            <Router>
                <Header role={user?.role} logout={logout} />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login onLogin={login} />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/profile/create-ticket" element={<TicketFrom />} />
                    <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminPanel /></ProtectedRoute>} />
                </Routes>
                {user && <TicketList />}
                <Footer />
            </Router>
        </AuthContext.Provider>
    );
};

export default App;
