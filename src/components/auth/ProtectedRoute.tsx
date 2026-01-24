import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactElement; // Using React.ReactElement instead of JSX.Element to avoid namespace issues
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-amber-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    if (!user) {
        // Redirect to welcome page if not logged in
        // We use replace to prevent back button from creating a loop
        return <Navigate to="/" replace />;
    }

    return children;
};
