import { motion } from 'framer-motion';
import type { ArchivalDocument } from '../data/documents';
import { Calendar, ArrowRight } from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';
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
    const { documents, loading } = useDocuments();

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

    const filteredDocs = documents.filter(doc => {
        // Filter by Difficulty
        if (filters.difficulty && filters.difficulty !== 'Tümü') {
            if (doc.difficulty !== filters.difficulty) return false;
        }
        // Filter by Category
        if (filters.category && filters.category !== 'Tümü') {
            if (doc.category !== filters.category) return false;
        }
        // Filter by Year
        if (filters.year && filters.year !== 'Tümü') {
            if (doc.year !== parseInt(filters.year)) return false;
        }
        return true;
    });

    if (filteredDocs.length === 0) {
        return (
            <div className="text-center py-16 text-gray-400">
                <p>Aradığınız kriterlere uygun belge bulunamadı.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDocs.map((doc, index) => (
                <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => onSelect(doc)}
                    className="group cursor-pointer bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-amber-700 transition-all shadow-sm hover:shadow-md"
                >
                    <div className="h-48 overflow-hidden bg-gray-100">
                        <img
                            src={doc.imageUrl}
                            alt={doc.title}
                            className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                        />
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
                        <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-amber-800 transition-colors">
                            {doc.title}
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-500 border-t border-gray-50 pt-4">
                            <span className="flex items-center gap-1.5">
                                <Calendar size={14} className="text-gray-400" /> {doc.date}
                            </span>
                            <span className="flex items-center gap-1.5 justify-end group-hover:text-amber-700 transition-all">
                                İncele <ArrowRight size={14} />
                            </span>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
