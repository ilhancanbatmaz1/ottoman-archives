import React, { createContext, useContext, useState, useEffect } from 'react';
import { FeedbackService } from '../services/FeedbackService';

export interface ErrorReport {
    id: string;
    documentId: string;
    documentTitle: string;
    wordId: string;
    originalWord: string;
    currentModern: string;
    suggestedModern: string;
    reporterNote: string;
    createdAt: string;
    status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
}

interface FeedbackContextType {
    errorReports: ErrorReport[];
    addErrorReport: (report: Omit<ErrorReport, 'id' | 'createdAt' | 'status'>) => void;
    updateReportStatus: (id: string, status: ErrorReport['status']) => void;
    deleteReport: (id: string) => void;
    getPendingCount: () => number;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [errorReports, setErrorReports] = useState<ErrorReport[]>([]);

    useEffect(() => {
        setErrorReports(FeedbackService.getAllReports());
    }, []);

    const addErrorReport = (report: Omit<ErrorReport, 'id' | 'createdAt' | 'status'>) => {
        const newReport: ErrorReport = {
            ...report,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            status: 'pending'
        };
        FeedbackService.addReport(newReport);
        setErrorReports(FeedbackService.getAllReports());
    };

    const updateReportStatus = (id: string, status: ErrorReport['status']) => {
        const report = errorReports.find(r => r.id === id);
        if (report) {
            FeedbackService.updateReport({ ...report, status });
            setErrorReports(FeedbackService.getAllReports());
        }
    };

    const deleteReport = (id: string) => {
        FeedbackService.deleteReport(id);
        setErrorReports(FeedbackService.getAllReports());
    };

    const getPendingCount = () => {
        return errorReports.filter(r => r.status === 'pending').length;
    };

    return (
        <FeedbackContext.Provider value={{
            errorReports,
            addErrorReport,
            updateReportStatus,
            deleteReport,
            getPendingCount
        }}>
            {children}
        </FeedbackContext.Provider>
    );
};

export const useFeedback = () => {
    const context = useContext(FeedbackContext);
    if (!context) {
        throw new Error('useFeedback must be used within a FeedbackProvider');
    }
    return context;
};
