import { useLearning } from '../context/LearningContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    TrendingUp, Target, Flame, Award, BookOpen,
    AlertTriangle, Calendar, Zap, ArrowLeft, Trophy, Trash2
} from 'lucide-react';

export const ProgressPage = () => {
    const { getStats, badges, getDifficultWords, getWordsToReview, profile, updateProfile } = useLearning();
    const { deleteAccount } = useAuth();
    const navigate = useNavigate();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const stats = getStats();
    const difficultWords = getDifficultWords();
    const wordsToReview = getWordsToReview();
    const unlockedBadges = badges.filter(b => b.unlockedAt);
    const lockedBadges = badges.filter(b => !b.unlockedAt);

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        setDeleteError(null);
        const result = await deleteAccount();
        setIsDeleting(false);

        if (result.success) {
            navigate('/');
        } else {
            setDeleteError(result.message || 'Bir hata oluştu');
        }
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
                    <h1 className="text-xl font-bold text-gray-900">İlerleme Durumu</h1>
                    <div className="w-20" />
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
                {/* User Profile */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-2xl p-6 text-white shadow-xl"
                >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="text-amber-200 text-sm font-bold uppercase tracking-wider mb-1">Hoş Geldin</div>
                            {profile.name ? (
                                <h2 className="text-3xl font-black">{profile.name}</h2>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Adınızı girin..."
                                        className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/60 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-white/50"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                updateProfile((e.target as HTMLInputElement).value);
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value) updateProfile(e.target.value);
                                        }}
                                    />
                                </div>
                            )}
                            <div className="text-amber-100 mt-2">{stats.level}</div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <div className="text-4xl font-black">{stats.xp}</div>
                                <div className="text-amber-200 text-xs font-bold uppercase">XP</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-black flex items-center gap-1">
                                    <Flame size={28} className="text-orange-300" />
                                    {stats.streak}
                                </div>
                                <div className="text-amber-200 text-xs font-bold uppercase">Seri</div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
                    >
                        <div className="flex items-center gap-2 text-green-600 mb-2">
                            <BookOpen size={20} />
                            <span className="text-xs font-bold uppercase">Öğrenilen</span>
                        </div>
                        <div className="text-3xl font-black text-gray-900">{stats.totalLearned}</div>
                        <div className="text-xs text-gray-500">kelime</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
                    >
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                            <Target size={20} />
                            <span className="text-xs font-bold uppercase">Doğruluk</span>
                        </div>
                        <div className="text-3xl font-black text-gray-900">%{stats.accuracy}</div>
                        <div className="text-xs text-gray-500">{stats.totalCorrect}/{stats.totalCorrect + stats.totalWrong}</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
                    >
                        <div className="flex items-center gap-2 text-purple-600 mb-2">
                            <Calendar size={20} />
                            <span className="text-xs font-bold uppercase">Bugün</span>
                        </div>
                        <div className="text-3xl font-black text-gray-900">{stats.todayAttempts}</div>
                        <div className="text-xs text-gray-500">deneme</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
                    >
                        <div className="flex items-center gap-2 text-amber-600 mb-2">
                            <TrendingUp size={20} />
                            <span className="text-xs font-bold uppercase">Bu Hafta</span>
                        </div>
                        <div className="text-3xl font-black text-gray-900">{stats.weeklyAttempts}</div>
                        <div className="text-xs text-gray-500">deneme</div>
                    </motion.div>
                </div>

                {/* Accuracy Chart (Simple) */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                >
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Zap className="text-amber-600" size={20} />
                        Performans
                    </h3>
                    <div className="flex items-center gap-6">
                        {/* Simple donut chart */}
                        <div className="relative w-32 h-32">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle
                                    cx="50" cy="50" r="40"
                                    fill="none" stroke="#f3f4f6" strokeWidth="12"
                                />
                                <circle
                                    cx="50" cy="50" r="40"
                                    fill="none" stroke="#22c55e" strokeWidth="12"
                                    strokeDasharray={`${stats.accuracy * 2.51} 251`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-black text-gray-900">%{stats.accuracy}</span>
                            </div>
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Doğru Cevaplar</span>
                                <span className="font-bold text-green-600">{stats.totalCorrect}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Yanlış Cevaplar</span>
                                <span className="font-bold text-red-500">{stats.totalWrong}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Toplam Deneme</span>
                                <span className="font-bold text-gray-900">{stats.totalCorrect + stats.totalWrong}</span>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Badges */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                >
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Award className="text-amber-600" size={20} />
                        Rozetler ({unlockedBadges.length}/{badges.length})
                    </h3>

                    {unlockedBadges.length > 0 && (
                        <div className="mb-4">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Kazanılan</div>
                            <div className="flex flex-wrap gap-3">
                                {unlockedBadges.map(badge => (
                                    <div
                                        key={badge.id}
                                        className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2"
                                    >
                                        <span className="text-2xl">{badge.icon}</span>
                                        <div>
                                            <div className="font-bold text-amber-900 text-sm">{badge.name}</div>
                                            <div className="text-xs text-amber-700">{badge.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {lockedBadges.length > 0 && (
                        <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Kilitli</div>
                            <div className="flex flex-wrap gap-3">
                                {lockedBadges.map(badge => (
                                    <div
                                        key={badge.id}
                                        className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 opacity-50"
                                    >
                                        <span className="text-2xl grayscale">🔒</span>
                                        <div>
                                            <div className="font-bold text-gray-600 text-sm">{badge.name}</div>
                                            <div className="text-xs text-gray-500">{badge.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.section>

                {/* Words to Review */}
                {wordsToReview.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-blue-50 rounded-2xl p-6 border border-blue-200"
                    >
                        <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                            <Calendar className="text-blue-600" size={20} />
                            Bugün Tekrar Edilecek ({wordsToReview.length} kelime)
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {wordsToReview.slice(0, 10).map((word, i) => (
                                <div key={i} className="bg-white rounded-lg px-3 py-2 border border-blue-100">
                                    <span className="text-lg script-font">{word.original}</span>
                                    <span className="text-gray-400 mx-2">→</span>
                                    <span className="font-bold text-blue-700">{word.modern}</span>
                                </div>
                            ))}
                            {wordsToReview.length > 10 && (
                                <div className="bg-blue-100 rounded-lg px-3 py-2 text-blue-700 font-bold">
                                    +{wordsToReview.length - 10} daha
                                </div>
                            )}
                        </div>
                    </motion.section>
                )}

                {/* Difficult Words */}
                {difficultWords.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="bg-red-50 rounded-2xl p-6 border border-red-200"
                    >
                        <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
                            <AlertTriangle className="text-red-600" size={20} />
                            Zorlandığınız Kelimeler
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {difficultWords.map((word, i) => (
                                <div key={i} className="bg-white rounded-lg px-3 py-2 border border-red-100">
                                    <span className="text-lg script-font">{word.original}</span>
                                    <span className="text-gray-400 mx-2">→</span>
                                    <span className="font-bold text-red-700">{word.modern}</span>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* Quick Links */}
                <div className="flex flex-wrap gap-4 justify-center pt-4">
                    <Link to="/dictionary" className="flex items-center gap-2 px-6 py-3 bg-amber-100 text-amber-800 rounded-xl font-bold hover:bg-amber-200 transition-colors">
                        <BookOpen size={18} />
                        Sözlüğüm
                    </Link>
                    <Link to="/leaderboard" className="flex items-center gap-2 px-6 py-3 bg-purple-100 text-purple-800 rounded-xl font-bold hover:bg-purple-200 transition-colors">
                        <Trophy size={18} />
                        Liderlik Tablosu
                    </Link>
                </div>

                {/* Account Settings */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-8"
                >
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Hesap Ayarları</h3>
                    <div className="border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-bold text-red-600">Hesabı Sil</div>
                                <div className="text-sm text-gray-500">
                                    Bu işlem geri alınamaz. Tüm verileriniz silinecektir.
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors border border-red-200"
                            >
                                <Trash2 size={16} />
                                Hesabı Sil
                            </button>
                        </div>
                    </div>
                </motion.section>
            </main>

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
                    >
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle size={32} className="text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Hesabınızı silmek istediğinize emin misiniz?
                            </h3>
                            <p className="text-gray-500">
                                Bu işlem geri alınamaz. Tüm öğrenme ilerlemeniz, rozetleriniz ve kişisel verileriniz kalıcı olarak silinecektir.
                            </p>
                        </div>

                        {deleteError && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl mb-4 text-center text-sm">
                                {deleteError}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Siliniyor...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        Evet, Sil
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
