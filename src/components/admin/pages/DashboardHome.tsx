import { motion } from 'framer-motion';
import { Users, FileText, BookOpen, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useDocuments } from '../../../context/DocumentContext';
import { useFeedback } from '../../../context/FeedbackContext';
import { StatCard } from '../StatCard';

export const DashboardHome = () => {
    const { users } = useAuth();
    const { documents } = useDocuments();
    const { errorReports, getPendingCount } = useFeedback();

    // Calculate stats
    const totalUsers = users.length;
    const totalDocuments = documents.length;
    const totalWords = documents.reduce((sum, doc) => sum + doc.tokens.length, 0);
    const pendingReports = getPendingCount();

    const popularDocs = [...documents]
        .sort((a, b) => b.tokens.length - a.tokens.length)
        .slice(0, 5);

    const recentReports = [...errorReports]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    const difficultyStats = documents.reduce((acc, doc) => {
        acc[doc.difficulty] = (acc[doc.difficulty] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-3xl font-black text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-500">Sistem genel durumu ve istatistikler</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Toplam Kullanıcı" value={totalUsers} icon={Users} color="blue" subtitle="Kayıtlı kullanıcılar" />
                <StatCard title="Toplam Belge" value={totalDocuments} icon={FileText} color="amber" subtitle="Arşivlenen belgeler" />
                <StatCard title="Toplam Kelime" value={totalWords} icon={BookOpen} color="green" subtitle="Etiketlenmiş kelimeler" />
                <StatCard title="Bekleyen Raporlar" value={pendingReports} icon={AlertTriangle} color="orange" subtitle="İncelenmesi gereken" />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={20} className="text-amber-600" />
                        <h2 className="text-lg font-bold text-gray-900">En Çok Kelimeli Belgeler</h2>
                    </div>
                    <div className="space-y-3">
                        {popularDocs.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-8">Henüz belge yok</p>
                        ) : (
                            popularDocs.map((doc, index) => (
                                <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold text-sm">#{index + 1}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-gray-900 truncate">{doc.title}</div>
                                        <div className="text-xs text-gray-500">{doc.category} • {doc.year}</div>
                                    </div>
                                    <div className="text-sm font-bold text-gray-600">{doc.tokens.length} kelime</div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity size={20} className="text-orange-600" />
                        <h2 className="text-lg font-bold text-gray-900">Son Hata Bildirimleri</h2>
                    </div>
                    <div className="space-y-3">
                        {recentReports.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-8">Henüz bildirim yok</p>
                        ) : (
                            recentReports.map(report => (
                                <div key={report.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold text-gray-500">{report.documentTitle}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${report.status === 'pending' ? 'bg-orange-100 text-orange-700' : report.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {report.status === 'pending' ? 'Bekliyor' : report.status === 'accepted' ? 'Kabul' : 'Red'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="line-through text-red-500">{report.currentModern}</span>
                                        <span className="text-gray-400">→</span>
                                        <span className="font-bold text-green-600">{report.suggestedModern}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Difficulty Distribution */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Belge Zorluk Dağılımı</h2>
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <div className="text-3xl font-black text-green-700">{difficultyStats['Kolay'] || 0}</div>
                        <div className="text-sm font-bold text-green-600 mt-1">Kolay</div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                        <div className="text-3xl font-black text-yellow-700">{difficultyStats['Orta'] || 0}</div>
                        <div className="text-sm font-bold text-yellow-600 mt-1">Orta</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <div className="text-3xl font-black text-red-700">{difficultyStats['Zor'] || 0}</div>
                        <div className="text-sm font-bold text-red-600 mt-1">Zor</div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
