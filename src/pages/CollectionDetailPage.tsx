import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Lock, PlayCircle } from 'lucide-react';
import { CollectionService } from '../services/CollectionService';
import { useAuth } from '../context/AuthContext';
import type { CollectionWithDocuments } from '../types/collection';

export function CollectionDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [collection, setCollection] = useState<CollectionWithDocuments | null>(null);
    const [progress, setProgress] = useState(0);
    const [completedDocIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadCollection();
        }
    }, [id, user]);

    const loadCollection = async () => {
        if (!id) return;

        setLoading(true);
        const data = await CollectionService.getCollectionById(id);
        setCollection(data);

        if (user && data) {
            const userProgress = await CollectionService.getUserProgress(user.id, id);
            setProgress(userProgress);

            // Get completed document IDs (simplified - would need actual user progress data)
            // For now, just mark progress-based completion
            // TODO: Fetch actual completed_document_ids from user_collection_progress
        }

        setLoading(false);
    };

    const handleDocumentClick = (documentId: string) => {
        // Navigate to document viewer
        navigate(`/?doc=${documentId}`);
    };

    const getFirstIncompleteDocument = () => {
        if (!collection || !collection.documents) return null;
        return collection.documents.find((doc) => !completedDocIds.includes(doc.id));
    };

    const handleContinue = () => {
        const firstIncomplete = getFirstIncompleteDocument();
        if (firstIncomplete) {
            navigate(`/?doc=${firstIncomplete.id}`);
        } else if (collection && collection.documents.length > 0) {
            // All complete, go to first document
            navigate(`/?doc=${collection.documents[0].id}`);
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Kolay': return 'text-green-600';
            case 'Orta': return 'text-yellow-600';
            case 'Zor': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!collection) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Koleksiyon bulunamadı</h2>
                    <Link to="/collections" className="text-amber-600 hover:text-amber-700 font-medium">
                        ← Koleksiyonlara dön
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
            {/* Header */}
            <nav className="sticky top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/collections" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft size={20} />
                        <span className="font-bold">Koleksiyonlar</span>
                    </Link>
                    <div className="flex-1" />
                </div>
            </nav>

            {/* Content */}
            <main className="max-w-5xl mx-auto px-6 py-8">
                {/* Collection Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-2xl p-8 text-white mb-8 shadow-xl"
                >
                    <div className="flex items-start gap-6">
                        <div className="text-7xl">{collection.icon}</div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-black mb-2">{collection.title}</h1>
                            <p className="text-amber-100 mb-4">{collection.description}</p>

                            <div className="flex items-center gap-4 mb-4">
                                {collection.difficulty && (
                                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
                                        {collection.difficulty}
                                    </span>
                                )}
                                <span className="text-amber-100 text-sm font-medium">
                                    {collection.documents?.length || 0} belge
                                </span>
                            </div>

                            {/* Progress */}
                            {user && (
                                <div className="mb-4">
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-amber-200 font-medium">İlerleme</span>
                                        <span className="text-white font-bold">{progress}%</span>
                                    </div>
                                    <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 0.8 }}
                                            className="h-full bg-white rounded-full"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Continue Button */}
                            <button
                                onClick={handleContinue}
                                className="bg-white text-amber-700 px-6 py-3 rounded-xl font-bold hover:bg-amber-50 transition-colors flex items-center gap-2"
                            >
                                <PlayCircle size={20} />
                                {progress === 0 ? 'Başla' : progress === 100 ? 'Tekrar Başla' : 'Devam Et'}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Documents List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Belgeler</h2>

                    {collection.documents && collection.documents.length > 0 ? (
                        collection.documents.map((document, index) => {
                            const isCompleted = completedDocIds.includes(document.id);

                            return (
                                <motion.div
                                    key={document.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => handleDocumentClick(document.id)}
                                    className="bg-white rounded-xl p-4 border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Order Number */}
                                        <div className="flex-shrink-0 w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                                            <span className="text-xl font-bold text-amber-700">{index + 1}</span>
                                        </div>

                                        {/* Thumbnail */}
                                        <div className="flex-shrink-0">
                                            <img
                                                src={document.imageUrl}
                                                alt={document.title}
                                                className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                            />
                                        </div>

                                        {/* Document Info */}
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 group-hover:text-amber-700 transition-colors">
                                                {document.title}
                                            </h3>
                                            <p className={`text-sm font-medium ${getDifficultyColor(document.difficulty)}`}>
                                                {document.difficulty}
                                            </p>
                                        </div>

                                        {/* Status */}
                                        <div className="flex-shrink-0">
                                            {isCompleted ? (
                                                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
                                                    <Check size={18} />
                                                    <span className="text-sm font-bold">Tamamlandı</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 bg-gray-50 text-gray-500 px-4 py-2 rounded-full">
                                                    <Lock size={18} />
                                                    <span className="text-sm font-medium">Bekliyor</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                            <div className="text-4xl mb-3">📄</div>
                            <p className="text-gray-600">Bu koleksiyonda henüz belge yok</p>
                        </div>
                    )}
                </div>

                {/* Tips */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6"
                >
                    <div className="flex items-start gap-4">
                        <div className="text-3xl">💬</div>
                        <div>
                            <h3 className="text-lg font-bold text-blue-900 mb-2">İpucu</h3>
                            <p className="text-sm text-blue-800">
                                Belgeleri sırayla okuyarak en iyi öğrenme deneyimini elde edebilirsiniz.
                                Her belgeyi hem okuma hem de pratik modunda deneyerek kelime dağarcığınızı geliştirin.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}

