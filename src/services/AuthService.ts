import { supabase } from '../lib/supabase';
import { StorageService } from './base/StorageService';
import type { User } from '../context/AuthContext';

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';
const IS_ADMIN_KEY = 'isAdmin';
const ADMIN_SESSION_KEY = 'admin_session';

/**
 * AuthService - Hybrid Authentication Service
 * 
 * This service supports both Supabase Auth (production) and LocalStorage (fallback/development).
 * Uses dual-write pattern during migration to prevent data loss.
 */
export class AuthService {
    // ========================================
    // SUPABASE AUTH METHODS (PRIMARY)
    // ========================================

    /**
     * Sign up a new user with Supabase Auth
     */
    static async signUpWithSupabase(email: string, password: string, username: string, fullName: string) {
        try {
            // Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username,
                        full_name: fullName
                    }
                }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('User creation failed');

            // Create user profile in public.users table
            const { error: profileError } = await supabase
                .from('users')
                .insert({
                    id: authData.user.id,
                    email,
                    username,
                    password_hash: '', // Managed by Supabase Auth
                    is_admin: false
                });

            if (profileError) throw profileError;

            // Initialize user progress
            await supabase.from('user_progress').insert({
                user_id: authData.user.id,
                total_words_learned: 0,
                documents_completed: 0,
                practice_sessions: 0,
                current_streak: 0,
                longest_streak: 0
            });

            return {
                success: true,
                user: authData.user,
                session: authData.session
            };
        } catch (error: any) {
            console.error('Supabase signup error:', error);

            let errorMessage = error.message;
            if (errorMessage && (errorMessage.includes('rate limit') || errorMessage.includes('security purposes'))) {
                errorMessage = 'Çok fazla deneme yaptınız. Lütfen biraz bekleyin veya Supabase panelinden e-posta onayını kapatın.';
            }

            return {
                success: false,
                error: errorMessage || 'Kayıt sırasında bir hata oluştu'
            };
        }
    }


    /**
     * Sign in with Supabase Auth
     */
    static async signInWithSupabase(email: string, password: string) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // Update last login
            if (data.user) {
                await supabase
                    .from('users')
                    .update({ last_login: new Date().toISOString() })
                    .eq('id', data.user.id);
            }

            return {
                success: true,
                user: data.user,
                session: data.session
            };
        } catch (error: any) {
            console.error('Supabase signin error:', error);
            return {
                success: false,
                error: error.message || 'Giriş yapılırken bir hata oluştu'
            };
        }
    }

    /**
     * Sign out from Supabase
     */
    static async signOutFromSupabase() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return { success: true };
        } catch (error: any) {
            console.error('Supabase signout error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get current Supabase session
     */
    static async getCurrentSession() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            return session;
        } catch (error) {
            console.error('Error getting session:', error);
            return null;
        }
    }

    /**
     * Get current user from Supabase
     */
    static async getCurrentSupabaseUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw error;
            return user;
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    }

    /**
     * Get user profile from database
     */
    static async getUserProfile(userId: string) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return { success: true, profile: data };
        } catch (error: any) {
            console.error('Error fetching profile:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Check if current user is admin
     */
    static async isUserAdmin() {
        try {
            const user = await this.getCurrentSupabaseUser();
            if (!user) return false;

            const { data } = await supabase
                .from('users')
                .select('is_admin')
                .eq('id', user.id)
                .single();

            return data?.is_admin || false;
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    }

    /**
     * Delete current user account
     */
    static async deleteCurrentUserAccount() {
        try {
            const user = await this.getCurrentSupabaseUser();
            if (!user) throw new Error('No authenticated user');

            // Delete user profile (CASCADE will delete related data)
            const { error: deleteError } = await supabase
                .from('users')
                .delete()
                .eq('id', user.id);

            if (deleteError) throw deleteError;

            // Sign out
            await this.signOutFromSupabase();

            return { success: true };
        } catch (error: any) {
            console.error('Error deleting account:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Admin: Get all users
     */
    static async getAllUsersFromSupabase() {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, email, username, created_at, last_login, is_admin')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, users: data };
        } catch (error: any) {
            console.error('Error fetching users:', error);
            return { success: false, error: error.message, users: [] };
        }
    }

    /**
     * Admin: Delete a user by ID
     */
    static async deleteUserByIdFromSupabase(userId: string) {
        try {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', userId);

            if (error) throw error;
            return { success: true };
        } catch (error: any) {
            console.error('Error deleting user:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Password reset request
     */
    static async requestPasswordReset(email: string) {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            });

            if (error) throw error;
            return { success: true };
        } catch (error: any) {
            console.error('Password reset error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update password
     */
    static async updatePassword(newPassword: string) {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;
            return { success: true };
        } catch (error: any) {
            console.error('Password update error:', error);
            return { success: false, error: error.message };
        }
    }

    // ========================================
    // LOCALSTORAGE METHODS (FALLBACK/LEGACY)
    // ========================================

    /**
     * Get users from LocalStorage
     */
    static getUsers(): User[] {
        return StorageService.getItem<User[]>(USERS_KEY, []);
    }

    /**
     * Get user by ID from LocalStorage
     */
    static getUserById(id: string): User | undefined {
        const users = this.getUsers();
        return users.find(u => u.id === id);
    }

    /**
     * Get current user from LocalStorage
     */
    static getCurrentUser(): User | null {
        return StorageService.getItem<User | null>(CURRENT_USER_KEY, null);
    }

    /**
     * Save user to LocalStorage
     */
    static saveUser(user: User): void {
        const users = this.getUsers();
        const existingIndex = users.findIndex(u => u.id === user.id);

        if (existingIndex >= 0) {
            users[existingIndex] = user;
        } else {
            users.push(user);
        }

        StorageService.setItem(USERS_KEY, users);
    }

    /**
     * Delete user from LocalStorage
     */
    static deleteUser(id: string): void {
        const users = this.getUsers();
        const filtered = users.filter(u => u.id !== id);
        StorageService.setItem(USERS_KEY, filtered);
    }

    /**
     * Login user (LocalStorage)
     */
    static loginUser(user: User): void {
        StorageService.setItem(CURRENT_USER_KEY, user);
    }

    /**
     * Logout user (LocalStorage)
     */
    static logoutUser(): void {
        StorageService.removeItem(CURRENT_USER_KEY);
    }

    // ========================================
    // ADMIN METHODS (LOCALSTORAGE)
    // ========================================

    /**
     * Check if admin (LocalStorage)
     */
    static isAdmin(): boolean {
        return StorageService.getItem<boolean>(IS_ADMIN_KEY, false);
    }

    /**
     * Set admin session (LocalStorage)
     */
    static setAdminSession(session: any): void {
        StorageService.setItem(ADMIN_SESSION_KEY, session);
        StorageService.setItem(IS_ADMIN_KEY, 'true');
    }

    /**
     * Clear admin session (LocalStorage)
     */
    static clearAdminSession(): void {
        StorageService.removeItem(ADMIN_SESSION_KEY);
        StorageService.removeItem(IS_ADMIN_KEY);
        StorageService.removeItem('admin_remember_me');
    }

    /**
     * Get admin session (LocalStorage)
     */
    static getAdminSession(): any {
        return StorageService.getItem<any>(ADMIN_SESSION_KEY, null);
    }

    // ========================================
    // UTILITY METHODS
    // ========================================

    /**
     * Check if Supabase is configured
     */
    static isSupabaseConfigured(): boolean {
        try {
            const url = import.meta.env.VITE_SUPABASE_URL;
            const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
            return !!(url && key && url !== 'your-project-url-here' && key !== 'your-anon-key-here');
        } catch {
            return false;
        }
    }

    /**
     * Get authentication mode
     */
    static getAuthMode(): 'supabase' | 'localstorage' {
        return this.isSupabaseConfigured() ? 'supabase' : 'localstorage';
    }
}
