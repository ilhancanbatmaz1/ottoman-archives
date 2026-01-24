import { supabase } from '../lib/supabase';
import { StorageService } from './base/StorageService';
import { AuthService } from './AuthService';
import type { LearningStats } from '../context/LearningContext';

const STATS_KEY = 'learning_stats';

/**
 * LearningService - Hybrid User Progress Service
 * 
 * Supports both Supabase (user_progress, user_word_progress, user_document_progress tables)
 * and LocalStorage fallback.
 */
export class LearningService {
    // ========================================
    // SUPABASE METHODS (PRIMARY)
    // ========================================

    /**
     * Get user progress from Supabase
     */
    static async getUserProgressFromSupabase() {
        try {
            const user = await AuthService.getCurrentSupabaseUser();
            if (!user) throw new Error('No authenticated user');

            const { data, error } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error) {
                // If no progress exists, create it
                if (error.code === 'PGRST116') {
                    const { data: newProgress, error: insertError } = await supabase
                        .from('user_progress')
                        .insert({
                            user_id: user.id,
                            total_words_learned: 0,
                            documents_completed: 0,
                            practice_sessions: 0,
                            current_streak: 0,
                            longest_streak: 0
                        })
                        .select()
                        .single();

                    if (insertError) throw insertError;
                    return { success: true, progress: newProgress };
                }
                throw error;
            }

            return { success: true, progress: data };
        } catch (error: any) {
            console.error('Error fetching user progress:', error);
            return { success: false, error: error.message, progress: null };
        }
    }

    /**
     * Update user progress in Supabase
     */
    static async updateUserProgressInSupabase(updates: {
        total_words_learned?: number;
        documents_completed?: number;
        practice_sessions?: number;
        current_streak?: number;
        longest_streak?: number;
        last_practice_date?: string;
    }) {
        try {
            const user = await AuthService.getCurrentSupabaseUser();
            if (!user) throw new Error('No authenticated user');

            const { data, error } = await supabase
                .from('user_progress')
                .update(updates)
                .eq('user_id', user.id)
                .select()
                .single();

            if (error) throw error;
            return { success: true, progress: data };
        } catch (error: any) {
            console.error('Error updating user progress:', error);
            return { success: false, error: error.message, progress: null };
        }
    }

    /**
     * Get user word progress from Supabase
     */
    static async getUserWordProgressFromSupabase() {
        try {
            const user = await AuthService.getCurrentSupabaseUser();
            if (!user) throw new Error('No authenticated user');

            const { data, error } = await supabase
                .from('user_word_progress')
                .select('*')
                .eq('user_id', user.id);

            if (error) throw error;
            return { success: true, words: data || [] };
        } catch (error: any) {
            console.error('Error fetching word progress:', error);
            return { success: false, error: error.message, words: [] };
        }
    }

    /**
     * Track word practice in Supabase
     */
    static async trackWordPracticeInSupabase(wordOttoman: string, wordLatin: string, translation: string, masteryLevel = 1) {
        try {
            const user = await AuthService.getCurrentSupabaseUser();
            if (!user) throw new Error('No authenticated user');

            // Check if word progress exists
            const { data: existing } = await supabase
                .from('user_word_progress')
                .select('*')
                .eq('user_id', user.id)
                .eq('word_ottoman', wordOttoman)
                .single();

            if (existing) {
                // Update existing
                const { error } = await supabase
                    .from('user_word_progress')
                    .update({
                        times_practiced: existing.times_practiced + 1,
                        mastery_level: Math.min(existing.mastery_level + masteryLevel, 5),
                        last_practiced: new Date().toISOString()
                    })
                    .eq('user_id', user.id)
                    .eq('word_ottoman', wordOttoman);

                if (error) throw error;
            } else {
                // Create new
                const { error } = await supabase
                    .from('user_word_progress')
                    .insert({
                        user_id: user.id,
                        word_ottoman: wordOttoman,
                        word_latin: wordLatin,
                        word_translation: translation,
                        mastery_level: masteryLevel,
                        times_practiced: 1,
                        last_practiced: new Date().toISOString()
                    });

                if (error) throw error;
            }

            return { success: true };
        } catch (error: any) {
            console.error('Error tracking word practice:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Mark document as completed in Supabase
     */
    static async markDocumentCompletedInSupabase(documentId: string) {
        try {
            const user = await AuthService.getCurrentSupabaseUser();
            if (!user) throw new Error('No authenticated user');

            // Upsert document progress
            const { error } = await supabase
                .from('user_document_progress')
                .upsert({
                    user_id: user.id,
                    document_id: documentId,
                    completed: true,
                    last_read_at: new Date().toISOString(),
                    practice_count: 1
                }, {
                    onConflict: 'user_id,document_id'
                });

            if (error) throw error;
            return { success: true };
        } catch (error: any) {
            console.error('Error marking document completed:', error);
            return { success: false, error: error.message };
        }
    }

    // ========================================
    // LOCALSTORAGE METHODS (FALLBACK)
    // ========================================

    /**
     * Get stats from LocalStorage
     */
    static getStats(): LearningStats {
        return StorageService.getItem<LearningStats>(STATS_KEY, {
            totalXP: 0,
            level: 1,
            wordsLearned: 0,
            streakDays: 0,
            lastLoginDate: new Date().toISOString(),
            documentsCompleted: [],
            dailyGoals: {
                words: 0,
                target: 10,
                lastUpdated: new Date().toDateString()
            }
        });
    }

    /**
     * Save stats to LocalStorage
     */
    static saveStats(stats: LearningStats): void {
        StorageService.setItem(STATS_KEY, stats);
    }

    // ========================================
    // HYBRID METHODS (AUTO-DETECT MODE)
    // ========================================

    /**
     * Get user stats - auto-detects backend
     */
    static async getUserStats(): Promise<{
        wordsLearned: number;
        documentsCompleted: number;
        currentStreak: number;
        longestStreak: number;
    }> {
        const mode = AuthService.getAuthMode();

        if (mode === 'supabase') {
            const result = await this.getUserProgressFromSupabase();
            if (result.success && result.progress) {
                return {
                    wordsLearned: result.progress.total_words_learned,
                    documentsCompleted: result.progress.documents_completed,
                    currentStreak: result.progress.current_streak,
                    longestStreak: result.progress.longest_streak
                };
            }
            return { wordsLearned: 0, documentsCompleted: 0, currentStreak: 0, longestStreak: 0 };
        } else {
            const stats = this.getStats();
            return {
                wordsLearned: stats.wordsLearned,
                documentsCompleted: stats.documentsCompleted.length,
                currentStreak: stats.streakDays,
                longestStreak: stats.streakDays // LocalStorage doesn't track this separately
            };
        }
    }

    /**
     * Track word - auto-detects backend
     */
    static async trackWord(ottoman: string, latin: string, translation: string): Promise<{ success: boolean }> {
        const mode = AuthService.getAuthMode();

        if (mode === 'supabase') {
            return await this.trackWordPracticeInSupabase(ottoman, latin, translation);
        } else {
            const stats = this.getStats();
            stats.wordsLearned++;
            this.saveStats(stats);
            return { success: true };
        }
    }

    /**
     * Mark document completed - auto-detects backend
     */
    static async completeDocument(documentId: string): Promise<{ success: boolean }> {
        const mode = AuthService.getAuthMode();

        if (mode === 'supabase') {
            return await this.markDocumentCompletedInSupabase(documentId);
        } else {
            const stats = this.getStats();
            if (!stats.documentsCompleted.includes(documentId)) {
                stats.documentsCompleted.push(documentId);
                this.saveStats(stats);
            }
            return { success: true };
        }
    }
}
