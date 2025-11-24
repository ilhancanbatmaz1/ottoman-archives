import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen } from 'lucide-react';
import { useDictionary, DictionaryEntry } from '../hooks/useDictionary';

export const DictionaryLookup = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<DictionaryEntry[]>([]);
    const { search } = useDictionary();

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                const data = await search(query);
                setResults(data);
            } else {
                setResults([]);
            }
        }, 300); // Debounce

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-stone-200 min-h-[500px]">
            <div className="flex items-center gap-3 mb-6 border-b pb-4 text-stone-700">
                <Search size={24} />
                <div>
                    <h2 className="text-lg font-bold">Osmanlıca Lügat</h2>
                    <p className="text-xs text-stone-500">Veritabanında Türkçe veya Osmanlıca arama yapın.</p>
                </div>
            </div>

            <div className="relative mb-6">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Kelime ara (örn: kalem, mektep, كتاب)..."
                    className="w-full p-4 pl-12 border-2 border-stone-200 rounded-xl focus:border-amber-500 outline-none text-lg"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400" size={20} />
                {query && (
                    <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600">
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className="space-y-2">
                {results.length > 0 ? (
                    results.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between p-4 bg-stone-50 hover:bg-amber-50 rounded-lg border border-stone-100 transition-colors group">
                            <span className="font-bold text-stone-700 capitalize">{entry.turkish}</span>
                            <span className="font-matbu text-2xl text-amber-800 group-hover:scale-110 transition-transform" dir="rtl">{entry.ottoman}</span>
                        </div>
                    ))
                ) : query.length >= 2 ? (
                    <div className="text-center text-stone-400 py-8">Sonuç bulunamadı.</div>
                ) : (
                    <div className="text-center text-stone-400 py-8 flex flex-col items-center">
                        <BookOpen size={48} className="opacity-20 mb-4" />
                        <p>Aramak istediğiniz kelimeyi yazın.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
