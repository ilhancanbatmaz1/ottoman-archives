import { useState } from 'react';
import { useLearning } from '../context/LearningContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ArrowLeft, Star, Search, BookOpen,
    StickyNote, Filter
} from 'lucide-react';

export const DictionaryPage = () => {
    const { favorites, notes, toggleFavorite, attempts } = useLearning();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'favorites' | 'notes'>('all');

    // Get all unique words from attempts
    const allWords = new Map<string, { original: string; modern: string; docId: string; wordId: string }>();
    attempts.forEach(a => {
        const key = `${a.docId}-${a.wordId}`;
        if (!allWords.has(key)) {
            allWords.set(key, { original: a.original, modern: a.modern, docId: a.docId, wordId: a.wordId });
        }
    });

    // Add words from notes that might not be in attempts
    notes.forEach(n => {
        const key = `${n.docId}-${n.wordId}`;
        if (!allWords.has(key)) {
            allWords.set(key, { original: n.original, modern: n.modern, docId: n.docId, wordId: n.wordId });
        }
    });

    // Filter words
    let filteredWords = Array.from(allWords.entries());

    if (filter === 'favorites') {
        filteredWords = filteredWords.filter(([key]) => favorites.includes(key));
    } else if (filter === 'notes') {
        filteredWords = filteredWords.filter(([key]) =>
            notes.some(n => `${n.docId}-${n.wordId}` === key)
        );
    }

    // Search filter
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredWords = filteredWords.filter(([, word]) =>
            word.original.includes(term) || word.modern.toLowerCase().includes(term)
        );
    }

    const getWordNote = (key: string) => {
        const [docId, wordId] = key.split('-');
        return notes.find(n => n.docId === docId && n.wordId === wordId);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
            {/* Header */}
            <nav className="sticky top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft size={20} />
                        <span className="font-bold">Ana Sayfa</span>
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <BookOpen className="text-amber-600" size={24} />
                        Kişisel Sözlüğüm
                    </h1>
                    <div className="w-20" />
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Kelime ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${filter === 'all'
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <Filter size={16} />
                            Tümü
                        </button>
                        <button
                            onClick={() => setFilter('favorites')}
                            className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${filter === 'favorites'
                                ? 'bg-amber-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <Star size={16} />
                            Favoriler ({favorites.length})
                        </button>
                        <button
                            onClick={() => setFilter('notes')}
                            className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${filter === 'notes'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <StickyNote size={16} />
                            Notlu ({notes.length})
                        </button>
                    </div>
                </div>

                {/* Word Count */}
                <div className="text-sm text-gray-500">
                    {filteredWords.length} kelime bulundu
                </div>

                {/* Words Grid */}
                {filteredWords.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredWords.map(([key, word], index) => {
                            const note = getWordNote(key);
                            const isFav = favorites.includes(key);

                            return (
                                <motion.div
                                    key={key}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.02 }}
                                    className={`bg-white rounded-xl p-4 border shadow-sm ${isFav ? 'border-amber-200' : 'border-gray-100'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-2xl script-font text-gray-800" dir="rtl">
                                                    {word.original}
                                                </span>
                                                <span className="text-gray-400">→</span>
                                                <span className="text-lg font-bold text-amber-700">
                                                    {word.modern}
                                                </span>
                                            </div>
                                            {note && (
                                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 mt-2">
                                                    <div className="flex items-start gap-2">
                                                        <StickyNote size={14} className="text-blue-500 mt-0.5 shrink-0" />
                                                        <p className="text-sm text-blue-800">{note.note}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => toggleFavorite(key)}
                                            className={`p-2 rounded-lg transition-colors ${isFav
                                                ? 'text-amber-500 hover:bg-amber-50'
                                                : 'text-gray-300 hover:text-amber-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            <Star size={20} fill={isFav ? 'currentColor' : 'none'} />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <BookOpen size={48} className="mx-auto text-gray-200 mb-4" />
                        <h3 className="text-lg font-bold text-gray-400">Henüz kelime yok</h3>
                        <p className="text-sm text-gray-400 mt-2">
                            {filter === 'favorites'
                                ? 'Favori kelime eklemek için pratik yaparken yıldız butonuna tıklayın.'
                                : filter === 'notes'
                                    ? 'Not eklemek için pratik yaparken not butonuna tıklayın.'
                                    : 'Pratik yapmaya başladığınızda kelimeleriniz burada görünecek.'
                            }
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors"
                        >
                            Pratik Yapmaya Başla
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
};
