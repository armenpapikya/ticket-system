/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
    const isAuthenticated = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} />;
    }

    if (requiredRole && userRole !== requiredRole) {
        return <Navigate to="/unauthorized" state={{ from: location }} />;
    }

    return children;
};

export default ProtectedRoute;
