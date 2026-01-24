import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { AuthService } from '../services/AuthService';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// User Interface - compatible with both LocalStorage and Supabase
export interface User {
    id: string;
    username: string;
    fullName: string;
    email?: string; // Added for Supabase compatibility
    password?: string; // Only used internally for LocalStorage, never exposed in context
    createdAt: number;
}

interface AuthContextType {
    user: User | null;
    users: User[];
    isLoading: boolean;
    authMode: 'supabase' | 'localstorage';
    login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; message?: string }>;
    signup: (username: string, password: string, fullName: string, email?: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => Promise<void>;
    deleteAccount: () => Promise<{ success: boolean; message?: string }>;
    isAuthenticated: boolean;
    // Admin functions
    getAllUsers: () => Promise<User[]>;
    getUserById: (id: string) => User | undefined;
    deleteUserById: (id: string) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within a AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [authMode] = useState<'supabase' | 'localstorage'>(AuthService.getAuthMode());

    // Initialize authentication state
    useEffect(() => {
        const initAuth = async () => {
            if (authMode === 'supabase') {
                // Supabase mode - check for existing session
                const session = await AuthService.getCurrentSession();

                if (session?.user) {
                    await loadSupabaseUser(session.user);
                }

                // Listen for auth state changes
                const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                    if (event === 'SIGNED_IN' && session?.user) {
                        await loadSupabaseUser(session.user);
                    } else if (event === 'SIGNED_OUT') {
                        setUser(null);
                    }
                });

                setIsLoading(false);

                return () => {
                    subscription.unsubscribe();
                };
            } else {
                // LocalStorage mode - legacy behavior
                const allUsers = AuthService.getUsers();
                const safeUsers = allUsers.map((u: User) => {
                    const { password, ...safeUser } = u;
                    return safeUser;
                });
                setUsers(safeUsers);

                const currentUser = AuthService.getCurrentUser();
                if (currentUser) {
                    const { password, ...safeUser } = currentUser;
                    setUser(safeUser);
                }

                setIsLoading(false);
            }
        };

        initAuth();
    }, [authMode]);

    // Helper: Load Supabase user with profile data
    const loadSupabaseUser = async (supabaseUser: SupabaseUser) => {
        const profileResult = await AuthService.getUserProfile(supabaseUser.id);

        if (profileResult.success && profileResult.profile) {
            const profile = profileResult.profile;
            setUser({
                id: profile.id,
                email: profile.email,
                username: profile.username,
                fullName: supabaseUser.user_metadata?.full_name || profile.username,
                createdAt: new Date(profile.created_at).getTime()
            });
        }
    };

    // Login - supports both modes
    const login = async (usernameOrEmail: string, password: string) => {
        if (authMode === 'supabase') {
            // Supabase login (email-based)
            const result = await AuthService.signInWithSupabase(usernameOrEmail, password);

            if (result.success && result.user) {
                await loadSupabaseUser(result.user);
                return { success: true };
            }

            return { success: false, message: result.error || 'Giriş yapılırken bir hata oluştu' };
        } else {
            // LocalStorage login (username-based)
            await new Promise(resolve => setTimeout(resolve, 500));

            const allUsers = AuthService.getUsers();
            const foundUser = allUsers.find((u: User) => u.username === usernameOrEmail && u.password === password);

            if (foundUser) {
                const { password: _, ...safeUser } = foundUser;
                setUser(safeUser);
                AuthService.loginUser(safeUser);
                return { success: true };
            }

            return { success: false, message: 'Kullanıcı adı veya şifre hatalı' };
        }
    };

    // Signup - supports both modes
    const signup = async (username: string, password: string, fullName: string, email?: string) => {
        if (authMode === 'supabase') {
            // Supabase signup requires email
            if (!email) {
                return { success: false, message: 'Email adresi gereklidir' };
            }

            const result = await AuthService.signUpWithSupabase(email, password, username, fullName);

            if (result.success && result.user) {
                await loadSupabaseUser(result.user);
                return { success: true };
            }

            return { success: false, message: result.error || 'Kayıt sırasında bir hata oluştu' };
        } else {
            // LocalStorage signup
            await new Promise(resolve => setTimeout(resolve, 500));

            const allUsers = AuthService.getUsers();

            if (allUsers.some((u: User) => u.username === username)) {
                return { success: false, message: 'Bu kullanıcı adı zaten alınmış' };
            }

            const newUser: User = {
                id: crypto.randomUUID(),
                username,
                password,
                fullName,
                email,
                createdAt: Date.now()
            };

            AuthService.saveUser(newUser);
            setUsers(prev => [...prev, newUser]);

            const { password: _, ...safeUser } = newUser;
            setUser(safeUser);
            AuthService.loginUser(safeUser);

            return { success: true };
        }
    };

    // Logout - supports both modes
    const logout = async () => {
        if (authMode === 'supabase') {
            await AuthService.signOutFromSupabase();
            setUser(null);
        } else {
            setUser(null);
            AuthService.logoutUser();
        }
    };

    // Delete account - supports both modes
    const deleteAccount = async () => {
        if (!user) {
            return { success: false, message: 'Giriş yapılmış bir hesap bulunamadı' };
        }

        try {
            if (authMode === 'supabase') {
                const result = await AuthService.deleteCurrentUserAccount();

                if (result.success) {
                    setUser(null);
                    return { success: true, message: 'Hesabınız başarıyla silindi' };
                }

                return { success: false, message: result.error || 'Hesap silinirken bir hata oluştu' };
            } else {
                await new Promise(resolve => setTimeout(resolve, 500));
                AuthService.deleteUser(user.id);
                AuthService.logoutUser();
                setUser(null);
                setUsers(prev => prev.filter(u => u.id !== user.id));
                return { success: true, message: 'Hesabınız başarıyla silindi' };
            }
        } catch {
            return { success: false, message: 'Hesap silinirken bir hata oluştu' };
        }
    };

    // Admin: Get all users - supports both modes
    const getAllUsers = async (): Promise<User[]> => {
        if (authMode === 'supabase') {
            const result = await AuthService.getAllUsersFromSupabase();

            if (result.success && result.users) {
                return result.users.map(u => ({
                    id: u.id,
                    username: u.username,
                    email: u.email,
                    fullName: u.username, // Fallback
                    createdAt: new Date(u.created_at).getTime()
                }));
            }

            return [];
        } else {
            const allUsers = AuthService.getUsers();
            return allUsers.map((u: User) => {
                const { password, ...safeUser } = u;
                return safeUser;
            });
        }
    };

    // Admin: Get user by ID (LocalStorage only for now)
    const getUserById = (id: string) => {
        if (authMode === 'localstorage') {
            const foundUser = AuthService.getUserById(id);
            if (foundUser) {
                const { password, ...safeUser } = foundUser;
                return safeUser;
            }
        }
        return undefined;
    };

    // Admin: Delete user by ID - supports both modes
    const deleteUserById = async (id: string) => {
        try {
            if (authMode === 'supabase') {
                const result = await AuthService.deleteUserByIdFromSupabase(id);

                if (result.success) {
                    return { success: true, message: 'Kullanıcı başarıyla silindi' };
                }

                return { success: false, message: result.error || 'Kullanıcı silinirken bir hata oluştu' };
            } else {
                await new Promise(resolve => setTimeout(resolve, 500));
                AuthService.deleteUser(id);
                setUsers(prev => prev.filter(u => u.id !== id));
                return { success: true, message: 'Kullanıcı başarıyla silindi' };
            }
        } catch {
            return { success: false, message: 'Kullanıcı silinirken bir hata oluştu' };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            users,
            isLoading,
            authMode,
            login,
            signup,
            logout,
            deleteAccount,
            isAuthenticated: !!user,
            getAllUsers,
            getUserById,
            deleteUserById
        }}>
            {children}
        </AuthContext.Provider>
    );
};
