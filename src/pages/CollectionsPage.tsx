import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Award } from 'lucide-react';
import { CollectionService } from '../services/CollectionService';
import { useAuth } from '../context/AuthContext';
import type { Collection } from '../types/collection';

export function CollectionsPage() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        loadCollections();
    }, [user]);

    const loadCollections = async () => {
        setLoading(true);
        const data = await CollectionService.getAllCollections();

        // If user logged in, get progress for each collection
        if (user) {
            const dataWithProgress = await Promise.all(
                data.map(async (collection) => {
                    const progress = await CollectionService.getUserProgress(user.id, collection.id);
                    return { ...collection, progress };
                })
            );
            setCollections(dataWithProgress);
        } else {
            setCollections(data);
        }

        setLoading(false);
    };

    const getDifficultyColor = (difficulty: string | null) => {
        switch (difficulty) {
            case 'Kolay': return 'bg-green-100 text-green-700';
            case 'Orta': return 'bg-yellow-100 text-yellow-700';
            case 'Zor': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
            {/* Header */}
            <nav className="sticky top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft size={20} />
                        <span className="font-bold">Ana Sayfa</span>
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">Öğrenme Koleksiyonları</h1>
                    <div className="w-20" />
                </div>
            </nav>

            {/* Content */}
            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h2 className="text-3xl font-black text-gray-900 mb-3">
                        📚 Belge Koleksiyonları
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Tematik olarak düzenlenmiş belge grupları ile öğrenme yolculuğunuza başlayın.
                        Her koleksiyon, belirli bir beceri seviyesi veya konuya odaklanır.
                    </p>
                </motion.div>

                {/* Loading State */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
                                <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
                                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                                <div className="h-2 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Collections Grid */}
                {!loading && collections.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {collections.map((collection, index) => (
                            <motion.div
                                key={collection.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link
                                    to={`/collections/${collection.id}`}
                                    className="block bg-white rounded-2xl p-6 border border-gray-100 hover:border-amber-200 hover:shadow-lg transition-all group"
                                >
                                    {/* Icon */}
                                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                                        {collection.icon}
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-700 transition-colors">
                                        {collection.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                        {collection.description}
                                    </p>

                                    {/* Metadata */}
                                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                                        {collection.difficulty && (
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${getDifficultyColor(collection.difficulty)}`}>
                                                {collection.difficulty}
                                            </span>
                                        )}
                                        <span className="text-xs text-gray-500 font-medium">
                                            {collection.document_count || 0} belge
                                        </span>
                                    </div>

                                    {/* Progress Bar (if logged in) */}
                                    {user && collection.progress !== undefined && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500 font-medium">İlerleme</span>
                                                <span className="text-amber-700 font-bold">{collection.progress}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${collection.progress}%` }}
                                                    transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
                                                    className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"
                                                />
                                            </div>
                                            {collection.progress > 0 && (
                                                <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                                    <TrendingUp size={12} />
                                                    <span>Devam ediyorsun!</span>
                                                </div>
                                            )}
                                            {collection.progress === 100 && (
                                                <div className="flex items-center gap-1 text-xs text-purple-600 font-bold">
                                                    <Award size={12} />
                                                    <span>Tamamlandı! 🎉</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* CTA for non-logged users */}
                                    {!user && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <p className="text-xs text-gray-500 italic">
                                                İlerlemenizi takip etmek için giriş yapın
                                            </p>
                                        </div>
                                    )}
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && collections.length === 0 && (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz koleksiyon yok</h3>
                        <p className="text-gray-600">
                            Yakında özenle seçilmiş belge koleksiyonları eklenecek.
                        </p>
                    </div>
                )}

                {/* Help Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 bg-amber-50 border border-amber-200 rounded-2xl p-6"
                >
                    <div className="flex items-start gap-4">
                        <div className="text-3xl">💡</div>
                        <div>
                            <h3 className="text-lg font-bold text-amber-900 mb-2">Nasıl Çalışır?</h3>
                            <ul className="space-y-2 text-sm text-amber-800">
                                <li className="flex items-start gap-2">
                                    <span className="font-bold">1.</span>
                                    <span>Seviyenize uygun bir koleksiyon seçin</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-bold">2.</span>
                                    <span>Belgeleri sırayla okuyun ve pratik yapın</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-bold">3.</span>
                                    <span>İlerlemenizi takip edin ve rozetler kazanın</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-bold">4.</span>
                                    <span>Tamamladığınızda daha zor koleksiyonlara geçin</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
