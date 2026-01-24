/**
 * Base Storage Service
 * Wraps localStorage operations to provide a consistent API.
 * Future migration to Supabase/Firebase will happen here.
 */
export class StorageService {
    static getItem<T>(key: string, defaultValue: T): T {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error reading key "${key}" from storage:`, error);
            return defaultValue;
        }
    }

    static setItem<T>(key: string, value: T): void {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error writing key "${key}" to storage:`, error);
        }
    }

    static removeItem(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing key "${key}" from storage:`, error);
        }
    }

    static clear(): void {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    }
}
