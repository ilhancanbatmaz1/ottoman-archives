import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { type ArchivalDocument } from '../data/documents';
import { Calendar, ArrowRight, AlertCircle, Search } from 'lucide-react';
import { DocumentService } from '../services/DocumentService';
import { Skeleton } from './Skeleton';

interface Props {
    onSelect: (doc: ArchivalDocument) => void;
    filters: {
        difficulty: string;
        category: string;
        year: string;
    };
}

export const ArchiveGrid = ({ onSelect, filters }: Props) => {
    // Local state for public browsing (detached from Admin context)
    const [documents, setDocuments] = useState<ArchivalDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchFilteredDocuments = async () => {
            setLoading(true);
            setError(null);
            try {
                // Prepare filters
                // "Tümü" means no filter, so we pass undefined
                const serviceFilters = {
                    difficulty: filters.difficulty !== 'Tümü' ? filters.difficulty : undefined,
                    category: filters.category !== 'Tümü' ? filters.category : undefined,
                    year: filters.year !== 'Tümü' ? parseInt(filters.year) : undefined,
                };

                const docs = await DocumentService.getAll(serviceFilters);
                setDocuments(docs);
            } catch (err) {
                console.error('Belgeler yüklenirken hata:', err);
                setError('Belgeler yüklenirken bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        };

        // Debounce fetching to prevent too many requests while selecting filters continuously
        const timeoutId = setTimeout(() => {
            fetchFilteredDocuments();
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [filters.difficulty, filters.category, filters.year]); // Re-fetch when ANY filter changes

    // Filter documents based on search query
    const filteredDocuments = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Loading State
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <Skeleton height={192} className="w-full" />
                        <div className="p-6">
                            <div className="flex gap-2 mb-3">
                                <Skeleton width={60} height={20} />
                                <Skeleton width={60} height={20} />
                            </div>
                            <Skeleton width="80%" height={28} className="mb-4" />
                            <div className="flex justify-between pt-4 border-t border-gray-50">
                                <Skeleton width={80} height={16} />
                                <Skeleton width={60} height={16} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16 text-red-500">
                <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-bold transition-colors">Yeniden Dene</button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Search Input */}
            <div className="relative max-w-md mx-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm shadow-sm transition-shadow"
                    placeholder="Belge adı veya kategori ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {filteredDocuments.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <p>Aradığınız kriterlere uygun belge bulunamadı.</p>
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            // Ideally trigger parent filter reset too if needed
                        }}
                        className="mt-2 text-sm text-amber-600 hover:underline"
                    >
                        Aramayı temizle
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredDocuments.map((doc, index) => (
                        <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => onSelect(doc)}
                            className="group cursor-pointer bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-amber-700 transition-all shadow-sm hover:shadow-md"
                        >
                            <div className="h-48 overflow-hidden bg-gray-100 relative">
                                <img
                                    src={doc.imageUrl}
                                    alt={doc.title}
                                    className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            <div className="p-6">
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                                        {doc.category}
                                    </span>
                                    {doc.difficulty && (
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${doc.difficulty === 'Kolay' ? 'bg-green-50 text-green-700' :
                                            doc.difficulty === 'Orta' ? 'bg-yellow-50 text-yellow-700' :
                                                'bg-red-50 text-red-700'
                                            }`}>
                                            {doc.difficulty}
                                        </span>
                                    )}
                                    {doc.year && (
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                                            {doc.year}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-amber-800 transition-colors line-clamp-2">
                                    {doc.title}
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-500 border-t border-gray-50 pt-4">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={14} className="text-gray-400" /> {doc.date}
                                    </span>
                                    <span className="flex items-center gap-1.5 justify-end text-amber-600 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all">
                                        İncele <ArrowRight size={14} />
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};
