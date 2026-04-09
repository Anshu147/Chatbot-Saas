import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from '../../store/slices/authSlice';

const ProtectedRoute = ({ children }) => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { isAuthenticated, loading, accessToken } = useSelector((state) => state.auth);

    useEffect(() => {
        // If we have a token but no user data, fetch the user
        if (accessToken && !isAuthenticated && !loading) {
            dispatch(getCurrentUser());
        }
    }, [accessToken, isAuthenticated, loading, dispatch]);

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated && !accessToken) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;