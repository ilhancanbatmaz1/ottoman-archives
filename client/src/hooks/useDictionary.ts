import { useState } from 'react';

export interface DictionaryEntry {
    id: number;
    turkish: string;
    ottoman: string;
    category?: string;
}

export const useDictionary = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const search = async (query: string): Promise<DictionaryEntry[]> => {
        if (!query || query.length < 2) return [];
        setLoading(true);
        try {
            const res = await fetch(`/api/dictionary/search?q=${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error('Search failed');
            const data = await res.json();
            return data;
        } catch (err: any) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const lookupBatch = async (words: string[]): Promise<Record<string, string>> => {
        try {
            const res = await fetch('/api/dictionary/batch-lookup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ words }),
            });
            if (!res.ok) throw new Error('Batch lookup failed');
            return await res.json();
        } catch (err) {
            console.error(err);
            return {};
        }
    };

    const addWord = async (turkish: string, ottoman: string, category: string = 'GENERAL') => {
        try {
            const res = await fetch('/api/dictionary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ turkish, ottoman, category }),
            });
            if (!res.ok) throw new Error('Failed to add word');
            return await res.json();
        } catch (err: any) {
            throw new Error(err.message);
        }
    };

    return { search, lookupBatch, addWord, loading, error };
};
