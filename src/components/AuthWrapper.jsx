import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/slices/authSlice';

/**
 * AuthWrapper Component
 * 
 * Protects child routes by checking authentication status.
 * If authenticated, renders child routes via <Outlet />.
 * If not authenticated, redirects to /login.
 */
const AuthWrapper = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default AuthWrapper;
