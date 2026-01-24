import React, { createContext, useContext, useState, useEffect } from 'react';
import { type ArchivalDocument } from '../data/documents';
import { DocumentService } from '../services/DocumentService';

interface DocumentContextType {
    documents: ArchivalDocument[];
    addDocument: (doc: ArchivalDocument) => void;
    updateDocument: (id: string, updates: Partial<ArchivalDocument>) => void;
    deleteDocument: (id: string) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [documents, setDocuments] = useState<ArchivalDocument[]>([]);

    useEffect(() => {
        setDocuments(DocumentService.getAllDocuments());
    }, []);

    const addDocument = (doc: ArchivalDocument) => {
        DocumentService.saveDocument(doc);
        setDocuments(DocumentService.getAllDocuments());
    };

    const deleteDocument = (id: string) => {
        DocumentService.deleteDocument(id);
        setDocuments(DocumentService.getAllDocuments());
    };

    const updateDocument = (id: string, updates: Partial<ArchivalDocument>) => {
        const doc = DocumentService.getDocumentById(id);
        if (doc) {
            const updated = { ...doc, ...updates };
            DocumentService.saveDocument(updated);
            setDocuments(DocumentService.getAllDocuments());
        }
    };

    return (
        <DocumentContext.Provider value={{ documents, addDocument, updateDocument, deleteDocument }}>
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
