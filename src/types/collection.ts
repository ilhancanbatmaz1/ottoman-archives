// Collection type interfaces for TypeScript

export interface Collection {
    id: string;
    title: string;
    description: string | null;
    icon: string;
    difficulty: 'Kolay' | 'Orta' | 'Zor' | null;
    order_index: number;
    is_public: boolean;
    created_at: string;
    updated_at: string;
    // Computed fields (not in DB)
    document_count?: number;
    progress?: number; // Percentage 0-100
}

export interface CollectionDocument {
    collection_id: string;
    document_id: string;
    order_index: number;
    created_at: string;
}

export interface UserCollectionProgress {
    user_id: string;
    collection_id: string;
    completed_document_ids: string[]; // Array of document IDs
    last_accessed: string;
}

export interface CollectionWithDocuments extends Collection {
    documents: {
        id: string;
        title: string;
        imageUrl: string;
        difficulty: string;
        order_index: number;
    }[];
}
