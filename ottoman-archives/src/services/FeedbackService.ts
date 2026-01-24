import { supabase } from '../lib/supabase';
import { StorageService } from './base/StorageService';
import { AuthService } from './AuthService';
import type { ErrorReport } from '../context/FeedbackContext';

const REPORTS_KEY = 'errorReports';

/**
 * FeedbackService - Hybrid Error Reporting Service
 * 
 * Supports both Supabase (PostgreSQL) and LocalStorage fallback.
 */
export class FeedbackService {
    // ========================================
    // SUPABASE METHODS (PRIMARY)
    // ========================================

    /**
     * Get all error reports from Supabase
     */
    static async getAllReportsFromSupabase(filters?: { status?: string }) {
        try {
            let query = supabase
                .from('error_reports')
                .select('*')
                .order('created_at', { ascending: false });

            if (filters?.status) {
                query = query.eq('status', filters.status as 'pending' | 'reviewed' | 'fixed' | 'rejected');
            }

            const { data, error } = await query;

            if (error) throw error;
            return { success: true, reports: data || [] };
        } catch (error: any) {
            console.error('Error fetching reports:', error);
            return { success: false, error: error.message, reports: [] };
        }
    }

    /**
     * Add error report to Supabase
     */
    static async addReportToSupabase(report: Omit<ErrorReport, 'id' | 'createdAt' | 'status'>) {
        try {
            const user = await AuthService.getCurrentSupabaseUser();

            const { data, error } = await supabase
                .from('error_reports')
                .insert({
                    document_id: report.documentId,
                    word_ottoman: report.originalWord,
                    word_latin_current: report.currentModern,
                    word_latin_suggested: report.suggestedModern,
                    description: report.reporterNote || null,
                    reported_by: user?.id || null,
                    status: 'pending'
                })
                .select()
                .single();

            if (error) throw error;
            return { success: true, report: data };
        } catch (error: any) {
            console.error('Error adding report:', error);
            return { success: false, error: error.message, report: null };
        }
    }

    /**
     * Update error report in Supabase
     */
    static async updateReportInSupabase(id: string, updates: Partial<{ status: string; admin_notes: string }>) {
        try {
            const updateData: any = {};

            if (updates.status) {
                updateData.status = updates.status;
                if (updates.status !== 'pending') {
                    updateData.resolved_at = new Date().toISOString();
                }
            }
            if (updates.admin_notes !== undefined) {
                updateData.admin_notes = updates.admin_notes;
            }

            const { data, error } = await supabase
                .from('error_reports')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return { success: true, report: data };
        } catch (error: any) {
            console.error('Error updating report:', error);
            return { success: false, error: error.message, report: null };
        }
    }

    /**
     * Delete error report from Supabase
     */
    static async deleteReportFromSupabase(id: string) {
        try {
            const { error } = await supabase
                .from('error_reports')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        } catch (error: any) {
            console.error('Error deleting report:', error);
            return { success: false, error: error.message };
        }
    }

    // ========================================
    // LOCALSTORAGE METHODS (FALLBACK)
    // ========================================

    /**
     * Get all error reports from LocalStorage
     */
    static getAllReports(): ErrorReport[] {
        return StorageService.getItem<ErrorReport[]>(REPORTS_KEY, []);
    }

    /**
     * Add error report to LocalStorage
     */
    static addReport(report: ErrorReport): void {
        const reports = this.getAllReports();
        reports.unshift(report);
        StorageService.setItem(REPORTS_KEY, reports);
    }

    /**
     * Update error report in LocalStorage
     */
    static updateReport(updatedReport: ErrorReport): void {
        const reports = this.getAllReports();
        const index = reports.findIndex(r => r.id === updatedReport.id);

        if (index >= 0) {
            reports[index] = updatedReport;
            StorageService.setItem(REPORTS_KEY, reports);
        }
    }

    /**
     * Delete error report from LocalStorage
     */
    static deleteReport(id: string): void {
        const reports = this.getAllReports();
        const filtered = reports.filter(r => r.id !== id);
        StorageService.setItem(REPORTS_KEY, filtered);
    }

    // ========================================
    // HYBRID METHODS (AUTO-DETECT MODE)
    // ========================================

    /**
     * Get all reports - auto-detects backend
     */
    static async getAll(filters?: { status?: string }): Promise<ErrorReport[]> {
        const mode = AuthService.getAuthMode();

        if (mode === 'supabase') {
            const result = await this.getAllReportsFromSupabase(filters);
            if (result.success) {
                // Map database format to ErrorReport format
                return result.reports.map(report => ({
                    id: report.id,
                    documentId: report.document_id,
                    documentTitle: '', // Not stored in DB, would need join
                    wordId: report.word_ottoman, // Using as word ID
                    originalWord: report.word_ottoman,
                    currentModern: report.word_latin_current,
                    suggestedModern: report.word_latin_suggested,
                    reporterNote: report.description || '',
                    createdAt: report.created_at,
                    status: report.status as any
                }));
            }
            return [];
        } else {
            // LocalStorage mode with client-side filtering
            let reports = this.getAllReports();

            if (filters?.status) {
                reports = reports.filter(r => r.status === filters.status);
            }

            return reports;
        }
    }

    /**
     * Add report - auto-detects backend
     */
    static async add(report: Omit<ErrorReport, 'id' | 'createdAt' | 'status'>): Promise<{ success: boolean; error?: string }> {
        const mode = AuthService.getAuthMode();

        if (mode === 'supabase') {
            const result = await this.addReportToSupabase(report);
            return { success: result.success, error: result.error };
        } else {
            const newReport: ErrorReport = {
                ...report,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                status: 'pending'
            };
            this.addReport(newReport);
            return { success: true };
        }
    }

    /**
     * Update report status - auto-detects backend
     */
    static async updateStatus(id: string, status: ErrorReport['status']): Promise<{ success: boolean; error?: string }> {
        const mode = AuthService.getAuthMode();

        if (mode === 'supabase') {
            const result = await this.updateReportInSupabase(id, { status });
            return { success: result.success, error: result.error };
        } else {
            const reports = this.getAllReports();
            const report = reports.find(r => r.id === id);
            if (report) {
                this.updateReport({ ...report, status });
                return { success: true };
            }
            return { success: false, error: 'Report not found' };
        }
    }

    /**
     * Delete report - auto-detects backend
     */
    static async delete(id: string): Promise<{ success: boolean; error?: string }> {
        const mode = AuthService.getAuthMode();

        if (mode === 'supabase') {
            return await this.deleteReportFromSupabase(id);
        } else {
            this.deleteReport(id);
            return { success: true };
        }
    }
}
