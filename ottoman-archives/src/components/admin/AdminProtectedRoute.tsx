import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import type { ReactNode } from 'react';

export const AdminProtectedRoute = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated, checkSession } = useAdminAuth();

    // Check if authenticated AND session is still valid
    if (!isAuthenticated || !checkSession()) {
        return <Navigate to="/admin" replace />;
    }

    return <>{children}</>;
};
