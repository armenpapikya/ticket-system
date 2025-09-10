/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children, requiredRole }) => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            let token = localStorage.getItem('token');
            let role = localStorage.getItem('role');
            if (!token) {
                // Փորձում ենք refresh անել accessToken-ը
                try {
                    const res = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
                    token = res.data.accessToken;
                    role = res.data.user.role;
                    localStorage.setItem('token', token);
                    localStorage.setItem('role', role);
                    setIsAuthenticated(true);
                    setUserRole(role);
                } catch (err) {
                    setIsAuthenticated(false);
                    setLoading(false);
                    return;
                }
            } else {
                setIsAuthenticated(true);
                setUserRole(role);
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    if (loading) return null; // կամ loading spinner

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} />;
    }

    if (requiredRole && userRole !== requiredRole) {
        return <Navigate to="/unauthorized" state={{ from: location }} />;
    }

    return children;
};

export default ProtectedRoute;
