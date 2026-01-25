import React, { createContext, useContext, useState, useEffect } from 'react';
import { type ArchivalDocument } from '../data/documents';
import { DocumentService } from '../services/DocumentService';

interface DocumentContextType {
    documents: ArchivalDocument[];
    loading: boolean;
    error: string | null;
    addDocument: (doc: ArchivalDocument) => Promise<void>;
    updateDocument: (id: string, updates: Partial<ArchivalDocument>) => Promise<void>;
    deleteDocument: (id: string) => Promise<void>;
    refreshDocuments: () => Promise<void>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [documents, setDocuments] = useState<ArchivalDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            setError(null);
            const docs = await DocumentService.getAll();
            setDocuments(docs);
        } catch (error: any) {
            console.error('Failed to fetch documents', error);
            setError(error.message || 'Belgeler yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const refreshDocuments = async () => {
        await fetchDocuments();
    };

    const addDocument = async (doc: ArchivalDocument) => {
        await DocumentService.create(doc);
        await fetchDocuments();
    };

    const deleteDocument = async (id: string) => {
        await DocumentService.delete(id);
        await fetchDocuments();
    };

    const updateDocument = async (id: string, updates: Partial<ArchivalDocument>) => {
        const result = await DocumentService.update(id, updates);
        if (!result.success) {
            throw new Error(result.error || 'Failed to update document');
        }
        await fetchDocuments();
    };

    return (
        <DocumentContext.Provider value={{ documents, loading, error, addDocument, updateDocument, deleteDocument, refreshDocuments }}>
            {children}
        </DocumentContext.Provider>
    );
};

export const useDocuments = () => {
    const context = useContext(DocumentContext);
    if (!context) {
        throw new Error('useDocuments must be used within a DocumentProvider');
    }
    return context;
};
