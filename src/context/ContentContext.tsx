import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { ContentService } from '../services/ContentService';

interface ContentContextType {
    content: Map<string, string>;
    isLoading: boolean;
    getContent: (key: string, defaultValue?: string) => string;
    refreshContent: () => Promise<void>;
    updateContent: (key: string, value: string) => Promise<boolean>;
}

const ContentContext = createContext<ContentContextType | null>(null);

export const useContentContext = () => {
    const context = useContext(ContentContext);
    if (!context) {
        throw new Error('useContentContext must be used within a ContentProvider');
    }
    return context;
};

// Helper hook for individual components
export const useContent = (key: string, defaultValue: string = '') => {
    const { getContent } = useContentContext();
    return getContent(key, defaultValue);
};

export const ContentProvider = ({ children }: { children: ReactNode }) => {
    const [contentMap, setContentMap] = useState<Map<string, string>>(new Map());
    const [isLoading, setIsLoading] = useState(true);

    const loadContent = async () => {
        setIsLoading(true);
        const data = await ContentService.getAllContent();
        const newMap = new Map<string, string>();

        data.forEach(item => {
            newMap.set(item.key, item.value);
        });

        setContentMap(newMap);
        setIsLoading(false);
    };

    useEffect(() => {
        loadContent();
    }, []);

    const getContent = (key: string, defaultValue: string = '') => {
        return contentMap.get(key) || defaultValue;
    };

    const refreshContent = async () => {
        await loadContent();
    };

    const updateContent = async (key: string, value: string) => {
        const result = await ContentService.updateContent(key, value);
        if (result.success) {
            // Optimistic update
            setContentMap(prev => new Map(prev).set(key, value));
            return true;
        }
        return false;
    };

    return (
        <ContentContext.Provider value={{
            content: contentMap,
            isLoading,
            getContent,
            refreshContent,
            updateContent
        }}>
            {children}
        </ContentContext.Provider>
    );
};
