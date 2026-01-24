import { AdminLayout } from '../../components/admin/AdminLayout';
import { useFeedback, type ErrorReport } from '../../context/FeedbackContext';
import { useToast } from '../../context/ToastContext';
import { DataTable, type Column } from '../../components/admin/DataTable';
import { Check, XCircle, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export const AdminReports = () => {
    const { errorReports, updateReportStatus, deleteReport } = useFeedback();
    const { showToast } = useToast();
    const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

    const filteredReports = filter === 'all'
        ? errorReports
        : errorReports.filter(r => r.status === filter);

    const handleAccept = (report: ErrorReport) => {
        updateReportStatus(report.id, 'accepted');
        showToast('success', 'Rapor kabul edildi');
    };

    const handleReject = (reportId: string) => {
        updateReportStatus(reportId, 'rejected');
        showToast('info', 'Rapor reddedildi');
    };

    const handleDelete = (reportId: string) => {
        deleteReport(reportId);
        showToast('success', 'Rapor silindi');
    };

    const columns: Column<ErrorReport>[] = [
        {
            key: 'createdAt',
            header: 'Tarih',
            render: (report) => (
                <div className="text-sm text-gray-600">
                    {new Date(report.createdAt).toLocaleDateString('tr-TR')}
                </div>
            ),
            sortable: true
        },
        {
            key: 'documentTitle',
            header: 'Belge',
            render: (report) => (
                <div className="font-bold text-gray-900">{report.documentTitle}</div>
            )
        },
        {
            key: 'originalWord',
            header: 'Kelime',
            render: (report) => (
                <div className="flex items-center gap-2">
                    <span className="text-lg script-font" dir="rtl">{report.originalWord}</span>
                </div>
            )
        },
        {
            key: 'currentModern',
            header: 'Öneri',
            render: (report) => (
                <div className="flex items-center gap-2">
                    <span className="line-through text-red-500 text-sm">{report.currentModern}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-bold text-green-600">{report.suggestedModern}</span>
                </div>
            )
        },
        {
            key: 'status',
            header: 'Durum',
            render: (report) => {
                const statusConfig = {
                    pending: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Bekliyor' },
                    accepted: { bg: 'bg-green-100', text: 'text-green-700', label: 'Kabul' },
                    rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Red' },
                    reviewed: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'İncelendi' }
                };
                const config = statusConfig[report.status];

                return (
                    <span className={`${config.bg} ${config.text} text-xs px-2 py-1 rounded font-bold`}>
                        {config.label}
                    </span>
                );
            },
            sortable: true
        },
        {
            key: 'id',
            header: 'İşlemler',
            render: (report) => (
                <div className="flex items-center gap-2">
                    {report.status === 'pending' && (
                        <>
                            <button
                                onClick={() => handleAccept(report)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Kabul Et"
                            >
                                <Check size={18} />
                            </button>
                            <button
                                onClick={() => handleReject(report.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Reddet"
                            >
                                <XCircle size={18} />
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => handleDelete(report.id)}
                        className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Sil"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ),
            sortable: false,
            searchable: false
        }
    ];

    const stats = {
        total: errorReports.length,
        pending: errorReports.filter(r => r.status === 'pending').length,
        accepted: errorReports.filter(r => r.status === 'accepted').length,
        rejected: errorReports.filter(r => r.status === 'rejected').length
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Hata Raporları</h1>
                    <p className="text-gray-500">Kullanıcılardan gelen latinizasyon hata bildirimleri</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => setFilter('all')}
                        className={`p-4 rounded-xl border-2 transition-all ${filter === 'all'
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                    >
                        <div className="text-2xl font-black text-gray-900">{stats.total}</div>
                        <div className="text-sm font-bold text-gray-600">Toplam</div>
                    </motion.button>

                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        onClick={() => setFilter('pending')}
                        className={`p-4 rounded-xl border-2 transition-all ${filter === 'pending'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                    >
                        <div className="text-2xl font-black text-orange-700">{stats.pending}</div>
                        <div className="text-sm font-bold text-orange-600">Bekliyor</div>
                    </motion.button>

                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        onClick={() => setFilter('accepted')}
                        className={`p-4 rounded-xl border-2 transition-all ${filter === 'accepted'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                    >
                        <div className="text-2xl font-black text-green-700">{stats.accepted}</div>
                        <div className="text-sm font-bold text-green-600">Kabul</div>
                    </motion.button>

                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        onClick={() => setFilter('rejected')}
                        className={`p-4 rounded-xl border-2 transition-all ${filter === 'rejected'
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                    >
                        <div className="text-2xl font-black text-red-700">{stats.rejected}</div>
                        <div className="text-sm font-bold text-red-600">Red</div>
                    </motion.button>
                </div>

                {/* Reports Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
                >
                    <DataTable
                        data={filteredReports}
                        columns={columns}
                        keyExtractor={(report) => report.id}
                        emptyMessage="Henüz hata bildirimi yok"
                        searchPlaceholder="Rapor ara..."
                    />
                </motion.div>
            </div>
        </AdminLayout>
    );
};
