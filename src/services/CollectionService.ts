// @ts-nocheck - Supabase types will be generated after running create_collections_feature.sql
import { supabase } from '../lib/supabase';
import type { Collection, CollectionDocument, UserCollectionProgress, CollectionWithDocuments } from '../types/collection';

export class CollectionService {
    // ============================================
    // Public Methods (for users)
    // ============================================

    /**
     * Get all public collections
     */
    static async getAllCollections(): Promise<Collection[]> {
        try {
            const { data, error } = await supabase
                .from('collections')
                .select('*')
                .eq('is_public', true)
                .order('order_index', { ascending: true });

            if (error) throw error;

            // Get document counts for each collection
            const collectionsWithCounts = await Promise.all(
                (data || []).map(async (collection) => {
                    const { count } = await supabase
                        .from('collection_documents')
                        .select('*', { count: 'exact', head: true })
                        .eq('collection_id', collection.id);

                    return {
                        ...collection,
                        document_count: count || 0,
                    };
                })
            );

            return collectionsWithCounts;
        } catch (error) {
            console.error('Error fetching collections:', error);
            return [];
        }
    }

    /**
     * Get single collection with all its documents
     */
    static async getCollectionById(collectionId: string): Promise<CollectionWithDocuments | null> {
        try {
            // Get collection metadata
            const { data: collection, error: collectionError } = await supabase
                .from('collections')
                .select('*')
                .eq('id', collectionId)
                .single();

            if (collectionError) throw collectionError;
            if (!collection) return null;

            // Get documents in this collection
            const { data: collectionDocs, error: docsError } = await supabase
                .from('collection_documents')
                .select('document_id, order_index')
                .eq('collection_id', collectionId)
                .order('order_index', { ascending: true });

            if (docsError) throw docsError;

            // Fetch full document details from localStorage or Supabase
            // Note: Assuming documents are stored in localStorage for now
            // TODO: If documents are in Supabase, fetch from there
            const documentsJson = localStorage.getItem('documents');
            const allDocuments = documentsJson ? JSON.parse(documentsJson) : [];

            const documents = (collectionDocs || [])
                .map((cd) => {
                    const doc = allDocuments.find((d: any) => d.id === cd.document_id);
                    return doc ? { ...doc, order_index: cd.order_index } : null;
                })
                .filter((d) => d !== null);

            return {
                ...collection,
                documents,
            };
        } catch (error) {
            console.error('Error fetching collection by ID:', error);
            return null;
        }
    }

    /**
     * Get user's progress for a specific collection
     */
    static async getUserProgress(userId: string, collectionId: string): Promise<number> {
        try {
            // Get total documents in collection
            const { count: totalDocs } = await supabase
                .from('collection_documents')
                .select('*', { count: 'exact', head: true })
                .eq('collection_id', collectionId);

            if (!totalDocs || totalDocs === 0) return 0;

            // Get user's completed documents
            const { data: progress } = await supabase
                .from('user_collection_progress')
                .select('completed_document_ids')
                .eq('user_id', userId)
                .eq('collection_id', collectionId)
                .single();

            if (!progress || !progress.completed_document_ids) return 0;

            const completedCount = Array.isArray(progress.completed_document_ids)
                ? progress.completed_document_ids.length
                : 0;

            return Math.round((completedCount / totalDocs) * 100);
        } catch (error) {
            console.error('Error fetching user progress:', error);
            return 0;
        }
    }

    /**
     * Mark a document as complete in a collection
     */
    static async markDocumentComplete(
        userId: string,
        collectionId: string,
        documentId: string
    ): Promise<boolean> {
        try {
            // Get existing progress
            const { data: existing } = await supabase
                .from('user_collection_progress')
                .select('completed_document_ids')
                .eq('user_id', userId)
                .eq('collection_id', collectionId)
                .single();

            let completedIds: string[] = [];
            if (existing && existing.completed_document_ids) {
                completedIds = Array.isArray(existing.completed_document_ids)
                    ? existing.completed_document_ids
                    : [];
            }

            // Add document if not already completed
            if (!completedIds.includes(documentId)) {
                completedIds.push(documentId);
            }

            // Upsert progress
            const { error } = await supabase
                .from('user_collection_progress')
                .upsert({
                    user_id: userId,
                    collection_id: collectionId,
                    completed_document_ids: completedIds,
                    last_accessed: new Date().toISOString(),
                });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error marking document complete:', error);
            return false;
        }
    }

    // ============================================
    // Admin Methods (for admin panel)
    // ============================================

    /**
     * Create new collection (Admin only)
     */
    static async createCollection(collection: Omit<Collection, 'id' | 'created_at' | 'updated_at'>): Promise<Collection | null> {
        try {
            const { data, error } = await supabase
                .from('collections')
                .insert({
                    title: collection.title,
                    description: collection.description,
                    icon: collection.icon,
                    difficulty: collection.difficulty,
                    order_index: collection.order_index,
                    is_public: collection.is_public,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating collection:', error);
            return null;
        }
    }

    /**
     * Update collection (Admin only)
     */
    static async updateCollection(
        collectionId: string,
        updates: Partial<Collection>
    ): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('collections')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', collectionId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error updating collection:', error);
            return false;
        }
    }

    /**
     * Delete collection (Admin only)
     */
    static async deleteCollection(collectionId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('collections')
                .delete()
                .eq('id', collectionId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting collection:', error);
            return false;
        }
    }

    /**
     * Add document to collection (Admin only)
     */
    static async addDocumentToCollection(
        collectionId: string,
        documentId: string,
        orderIndex: number = 0
    ): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('collection_documents')
                .insert({
                    collection_id: collectionId,
                    document_id: documentId,
                    order_index: orderIndex,
                });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error adding document to collection:', error);
            return false;
        }
    }

    /**
     * Remove document from collection (Admin only)
     */
    static async removeDocumentFromCollection(
        collectionId: string,
        documentId: string
    ): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('collection_documents')
                .delete()
                .eq('collection_id', collectionId)
                .eq('document_id', documentId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error removing document from collection:', error);
            return false;
        }
    }

    /**
     * Reorder documents in a collection (Admin only)
     */
    static async reorderDocuments(
        collectionId: string,
        documentOrders: { documentId: string; orderIndex: number }[]
    ): Promise<boolean> {
        try {
            // Update each document's order
            const updates = documentOrders.map(({ documentId, orderIndex }) =>
                supabase
                    .from('collection_documents')
                    .update({ order_index: orderIndex })
                    .eq('collection_id', collectionId)
                    .eq('document_id', documentId)
            );

            await Promise.all(updates);
            return true;
        } catch (error) {
            console.error('Error reordering documents:', error);
            return false;
        }
    }

    /**
     * Get all collections (including non-public, for admin)
     */
    static async getAllCollectionsAdmin(): Promise<Collection[]> {
        try {
            const { data, error } = await supabase
                .from('collections')
                .select('*')
                .order('order_index', { ascending: true });

            if (error) throw error;

            // Get document counts
            const collectionsWithCounts = await Promise.all(
                (data || []).map(async (collection) => {
                    const { count } = await supabase
                        .from('collection_documents')
                        .select('*', { count: 'exact', head: true })
                        .eq('collection_id', collection.id);

                    return {
                        ...collection,
                        document_count: count || 0,
                    };
                })
            );

            return collectionsWithCounts;
        } catch (error) {
            console.error('Error fetching collections (admin):', error);
            return [];
        }
    }

    /**
     * Get collections containing a specific document
     */
    static async getCollectionsContainingDocument(documentId: string): Promise<Collection[]> {
        try {
            const { data: collectionDocs, error } = await supabase
                .from('collection_documents')
                .select('collection_id')
                .eq('document_id', documentId);

            if (error) throw error;
            if (!collectionDocs || collectionDocs.length === 0) return [];

            const collectionIds = collectionDocs.map((cd) => cd.collection_id);

            const { data: collections, error: collectionsError } = await supabase
                .from('collections')
                .select('*')
                .in('id', collectionIds);

            if (collectionsError) throw collectionsError;
            return collections || [];
        } catch (error) {
            console.error('Error fetching collections containing document:', error);
            return [];
        }
    }
}
