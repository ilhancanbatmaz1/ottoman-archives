import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { AuthService } from '../services/AuthService';

interface AdminAuthContextType {
    isAuthenticated: boolean;
    login: (password: string, rememberMe: boolean) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
    checkSession: () => boolean;
    updateActivity: () => void;
    isRateLimited: boolean;
    getRateLimitTimeRemaining: () => number;
    logActivity: (action: string, details: string, userId?: string) => void;
    getActivityLogs: () => any[];
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error('useAdminAuth must be used within AdminAuthProvider');
    }
    return context;
};

// Configuration
const ADMIN_PASSWORD_HASH = import.meta.env.VITE_ADMIN_PASSWORD_HASH || 'f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2'; // Default fallback if env not set
const SESSION_TIMEOUT = 30 * 60 * 1000;

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [session, setSession] = useState<any | null>(null);

    // Load session
    useEffect(() => {
        const storedSession = AuthService.getAdminSession();
        if (storedSession) {
            const now = Date.now();
            if (now - storedSession.lastActivity < SESSION_TIMEOUT) {
                setSession(storedSession);
                setIsAuthenticated(true);
            } else {
                AuthService.clearAdminSession();
            }
        }
    }, []);

    // Session check loop
    useEffect(() => {
        if (!session) return;
        const interval = setInterval(() => {
            const now = Date.now();
            if (now - session.lastActivity >= SESSION_TIMEOUT) {
                logout();
            }
        }, 60000);
        return () => clearInterval(interval);
    }, [session]);

    const sha256 = async (message: string): Promise<string> => {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const login = async (password: string): Promise<{ success: boolean; message?: string }> => {
        // Basic implementation for demonstration
        const hashedPassword = await sha256(password);

        if (hashedPassword === ADMIN_PASSWORD_HASH) {
            const newSession = {
                token: crypto.randomUUID(),
                loginTime: Date.now(),
                lastActivity: Date.now()
            };
            setSession(newSession);
            setIsAuthenticated(true);
            AuthService.setAdminSession(newSession);
            return { success: true };
        }

        return { success: false, message: 'Hatalı şifre' };
    };

    const logout = () => {
        setIsAuthenticated(false);
        setSession(null);
        AuthService.clearAdminSession();
    };

    const checkSession = () => {
        if (!session) return false;
        return Date.now() - session.lastActivity < SESSION_TIMEOUT;
    };

    const updateActivity = () => {
        if (session) {
            const updated = { ...session, lastActivity: Date.now() };
            setSession(updated);
            AuthService.setAdminSession(updated);
        }
    };

    // Simplified for brevity - in real app would use ActivityService
    const logActivity = (action: string, details: string, userId?: string) => {
        const logs = JSON.parse(localStorage.getItem('admin_activity_logs') || '[]');
        logs.unshift({ id: crypto.randomUUID(), action, details, timestamp: Date.now(), userId });
        localStorage.setItem('admin_activity_logs', JSON.stringify(logs.slice(0, 500)));
    };

    const getActivityLogs = () => {
        return JSON.parse(localStorage.getItem('admin_activity_logs') || '[]');
    };

    return (
        <AdminAuthContext.Provider value={{
            isAuthenticated,
            login,
            logout,
            checkSession,
            updateActivity,
            isRateLimited: false,
            getRateLimitTimeRemaining: () => 0,
            logActivity,
            getActivityLogs
        }}>
            {children}
        </AdminAuthContext.Provider>
    );
};
