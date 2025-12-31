import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoggingOut } = useAuth();
    const location = useLocation();

    // If there is no token/user, redirect to the login page, 
    // but save the current location they were trying to go to
    // If we are logging out, do not redirect, let the router handle the transition to '/'
    if (!isAuthenticated && !isLoggingOut) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};
