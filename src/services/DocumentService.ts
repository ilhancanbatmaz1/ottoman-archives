import { supabase } from '../lib/supabase';
import { StorageService } from './base/StorageService';
import { initialDocuments, type ArchivalDocument } from '../data/documents';
import { AuthService } from './AuthService';

const DOCUMENTS_KEY = 'documents';
const STORAGE_BUCKET = 'document-images';

/**
 * DocumentService - Hybrid Document Management Service
 * 
 * Supports both Supabase (PostgreSQL + Storage) and LocalStorage fallback.
 * Uses auto-detection based on AuthService.getAuthMode()
 */
export class DocumentService {
    // ========================================
    // SUPABASE METHODS (PRIMARY)
    // ========================================

    /**
     * Get all documents from Supabase with optional filters
     */
    static async getAllDocumentsFromSupabase(filters?: {
        difficulty?: string;
        category?: string;
        year?: number;
    }) {
        try {
            let query = supabase
                .from('documents')
                .select('*')
                .order('created_at', { ascending: false });

            if (filters?.difficulty) {
                query = query.eq('difficulty', filters.difficulty.toLowerCase() as 'kolay' | 'orta' | 'zor');
            }
            if (filters?.category) {
                query = query.eq('category', filters.category);
            }
            if (filters?.year) {
                query = query.eq('year', filters.year);
            }

            const { data, error } = await query;

            if (error) throw error;
            return { success: true, documents: data || [] };
        } catch (error: any) {
            console.error('Error fetching documents:', error);
            return { success: false, error: error.message, documents: [] };
        }
    }

    /**
     * Get single document by ID from Supabase
     */
    static async getDocumentByIdFromSupabase(id: string) {
        try {
            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return { success: true, document: data };
        } catch (error: any) {
            console.error('Error fetching document:', error);
            return { success: false, error: error.message, document: null };
        }
    }

    /**
     * Upload image to Supabase Storage
     */
    static async uploadImage(file: File, fileName?: string) {
        try {
            const fileExt = file.name.split('.').pop();
            const uniqueFileName = fileName || `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `documents/${uniqueFileName}`;

            const { error: uploadError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(filePath);

            return {
                success: true,
                url: data.publicUrl,
                path: filePath
            };
        } catch (error: any) {
            console.error('Error uploading image:', error);
            return { success: false, error: error.message, url: null, path: null };
        }
    }

    /**
     * Delete image from Supabase Storage
     */
    static async deleteImage(filePath: string) {
        try {
            const { error } = await supabase.storage
                .from(STORAGE_BUCKET)
                .remove([filePath]);

            if (error) throw error;
            return { success: true };
        } catch (error: any) {
            console.error('Error deleting image:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Create new document in Supabase
     */
    static async createDocumentInSupabase(document: Omit<ArchivalDocument, 'id'>) {
        try {
            const user = await AuthService.getCurrentSupabaseUser();

            // Normalize difficulty to lowercase for database
            const difficulty = document.difficulty?.toLowerCase() as 'kolay' | 'orta' | 'zor' | undefined;

            const { data, error } = await supabase
                .from('documents')
                .insert({
                    title: document.title,
                    description: document.description || null,
                    image_url: document.imageUrl,
                    difficulty: difficulty || null,
                    category: document.category || null,
                    year: document.year || null,
                    transcription: document.transcription || null,
                    tokens: document.tokens || [], // Save tokens to JSONB column
                    uploaded_by: user?.id || null
                })
                .select()
                .single();

            if (error) throw error;
            return { success: true, document: data };
        } catch (error: any) {
            console.error('Error creating document:', error);
            return { success: false, error: error.message, document: null };
        }
    }

    /**
     * Update document in Supabase
     */
    static async updateDocumentInSupabase(id: string, updates: Partial<ArchivalDocument>) {
        try {
            const updateData: any = {};

            if (updates.title !== undefined) updateData.title = updates.title;
            if (updates.description !== undefined) updateData.description = updates.description;
            if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
            if (updates.difficulty !== undefined) updateData.difficulty = updates.difficulty;
            if (updates.category !== undefined) updateData.category = updates.category;
            if (updates.year !== undefined) updateData.year = updates.year;
            if (updates.transcription !== undefined) updateData.transcription = updates.transcription;
            if (updates.tokens !== undefined) updateData.tokens = updates.tokens;

            const { data, error } = await supabase
                .from('documents')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return { success: true, document: data };
        } catch (error: any) {
            console.error('Error updating document:', error);
            return { success: false, error: error.message, document: null };
        }
    }

    /**
     * Delete document from Supabase
     */
    static async deleteDocumentFromSupabase(id: string) {
        try {
            // First get the document to retrieve image path
            const { data: doc } = await supabase
                .from('documents')
                .select('image_url')
                .eq('id', id)
                .single();

            // Delete document (CASCADE will handle related data)
            const { error } = await supabase
                .from('documents')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Optionally delete image from storage
            if (doc?.image_url) {
                // Extract path from URL if it's a Supabase Storage URL
                const urlParts = doc.image_url.split('/');
                if (urlParts.includes('document-images')) {
                    const pathIndex = urlParts.indexOf('document-images') + 1;
                    const imagePath = urlParts.slice(pathIndex).join('/');
                    await this.deleteImage(`documents/${imagePath}`);
                }
            }

            return { success: true };
        } catch (error: any) {
            console.error('Error deleting document:', error);
            return { success: false, error: error.message };
        }
    }

    // ========================================
    // LOCALSTORAGE METHODS (FALLBACK)
    // ========================================

    /**
     * Get all documents from LocalStorage
     */
    static getAllDocuments(): ArchivalDocument[] {
        const docs = StorageService.getItem<ArchivalDocument[]>(DOCUMENTS_KEY, []);
        if (docs.length === 0 && initialDocuments.length > 0) {
            StorageService.setItem(DOCUMENTS_KEY, initialDocuments);
            return initialDocuments;
        }
        return docs;
    }

    /**
     * Get document by ID from LocalStorage
     */
    static getDocumentById(id: string): ArchivalDocument | undefined {
        const docs = this.getAllDocuments();
        return docs.find(d => d.id === id);
    }

    /**
     * Save document to LocalStorage
     */
    static saveDocument(doc: ArchivalDocument): void {
        const docs = this.getAllDocuments();
        const existingIndex = docs.findIndex(d => d.id === doc.id);

        if (existingIndex >= 0) {
            docs[existingIndex] = doc;
        } else {
            docs.push(doc);
        }

        StorageService.setItem(DOCUMENTS_KEY, docs);
    }

    /**
     * Delete document from LocalStorage
     */
    static deleteDocument(id: string): void {
        const docs = this.getAllDocuments();
        const filtered = docs.filter(d => d.id !== id);
        StorageService.setItem(DOCUMENTS_KEY, filtered);
    }

    // ========================================
    // HYBRID METHODS (AUTO-DETECT MODE)
    // ========================================

    /**
     * Get all documents - auto-detects backend
     */
    static async getAll(filters?: {
        difficulty?: string;
        category?: string;
        year?: number;
    }): Promise<ArchivalDocument[]> {
        const mode = AuthService.getAuthMode();

        if (mode === 'supabase') {
            const result = await this.getAllDocumentsFromSupabase(filters);
            if (result.success) {
                // Map database format to ArchivalDocument format
                return result.documents.map(doc => ({
                    id: doc.id,
                    title: doc.title,
                    description: doc.description || '',
                    imageUrl: doc.image_url,
                    difficulty: (doc.difficulty || 'orta') as any,
                    category: doc.category || 'Genel',
                    year: doc.year || undefined,
                    transcription: doc.transcription as any,
                    tokens: (doc as any).tokens || [] // Load tokens from DB
                }));
            }
            return [];
        } else {
            // LocalStorage mode with client-side filtering
            let docs = this.getAllDocuments();

            if (filters?.difficulty) {
                docs = docs.filter(d => d.difficulty === filters.difficulty);
            }
            if (filters?.category) {
                docs = docs.filter(d => d.category === filters.category);
            }
            if (filters?.year) {
                docs = docs.filter(d => d.year === filters.year);
            }

            return docs;
        }
    }

    /**
     * Get document by ID - auto-detects backend
     */
    static async getById(id: string): Promise<ArchivalDocument | null> {
        const mode = AuthService.getAuthMode();

        if (mode === 'supabase') {
            const result = await this.getDocumentByIdFromSupabase(id);
            if (result.success && result.document) {
                return {
                    id: result.document.id,
                    title: result.document.title,
                    description: result.document.description || '',
                    imageUrl: result.document.image_url,
                    difficulty: (result.document.difficulty || 'orta') as any,
                    category: result.document.category || 'Genel',
                    year: result.document.year || undefined,
                    transcription: result.document.transcription as any,
                    tokens: (result.document as any).tokens || [] // Load tokens from DB
                };
            }
            return null;
        } else {
            return this.getDocumentById(id) || null;
        }
    }

    /**
     * Create document - auto-detects backend
     */
    static async create(document: Omit<ArchivalDocument, 'id'>): Promise<{ success: boolean; document?: ArchivalDocument; error?: string }> {
        const mode = AuthService.getAuthMode();

        if (mode === 'supabase') {
            const result = await this.createDocumentInSupabase(document);
            if (result.success && result.document) {
                return {
                    success: true,
                    document: {
                        id: result.document.id,
                        title: result.document.title,
                        description: result.document.description || '',
                        imageUrl: result.document.image_url,
                        difficulty: (result.document.difficulty || 'orta') as any,
                        category: result.document.category || 'Genel',
                        year: result.document.year || undefined,
                        transcription: result.document.transcription as any,
                        tokens: []
                    }
                };
            }
            return { success: false, error: result.error };
        } else {
            const newDoc: ArchivalDocument = {
                id: crypto.randomUUID(),
                ...document
            };
            this.saveDocument(newDoc);
            return { success: true, document: newDoc };
        }
    }

    /**
     * Update document - auto-detects backend
     */
    static async update(id: string, updates: Partial<ArchivalDocument>): Promise<{ success: boolean; error?: string }> {
        const mode = AuthService.getAuthMode();

        if (mode === 'supabase') {
            const result = await this.updateDocumentInSupabase(id, updates);
            return { success: result.success, error: result.error };
        } else {
            const doc = this.getDocumentById(id);
            if (doc) {
                this.saveDocument({ ...doc, ...updates });
                return { success: true };
            }
            return { success: false, error: 'Document not found' };
        }
    }

    /**
     * Delete document - auto-detects backend
     */
    static async delete(id: string): Promise<{ success: boolean; error?: string }> {
        const mode = AuthService.getAuthMode();

        if (mode === 'supabase') {
            return await this.deleteDocumentFromSupabase(id);
        } else {
            this.deleteDocument(id);
            return { success: true };
        }
    }
}
