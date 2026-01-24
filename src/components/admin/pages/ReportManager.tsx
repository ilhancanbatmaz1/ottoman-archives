import { useState } from 'react';
import { Check, XCircle, Trash2 } from 'lucide-react';
import { useFeedback, type ErrorReport } from '../../../context/FeedbackContext';
import { useToast } from '../../../context/ToastContext';
import { DataTable, type Column } from '../DataTable';

export const ReportManager = () => {
    const { errorReports, updateReportStatus, deleteReport } = useFeedback();
    const { showToast } = useToast();
    const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

    const reportStats = {
        total: errorReports.length,
        pending: errorReports.filter(r => r.status === 'pending').length,
        accepted: errorReports.filter(r => r.status === 'accepted').length,
        rejected: errorReports.filter(r => r.status === 'rejected').length
    };

    // Filter logic
    const filteredReports = reportFilter === 'all' ? errorReports : errorReports.filter(r => r.status === reportFilter);

    // Report columns
    const reportColumns: Column<ErrorReport>[] = [
        {
            key: 'createdAt',
            header: 'Tarih',
            render: (report) => <div className="text-sm text-gray-600">{new Date(report.createdAt).toLocaleDateString('tr-TR')}</div>,
            sortable: true
        },
        {
            key: 'documentTitle',
            header: 'Belge',
            render: (report) => <div className="font-bold text-gray-900">{report.documentTitle}</div>
        },
        {
            key: 'originalWord',
            header: 'Kelime',
            render: (report) => <span className="text-lg script-font" dir="rtl">{report.originalWord}</span>
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
                const config = {
                    pending: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Bekliyor' },
                    accepted: { bg: 'bg-green-100', text: 'text-green-700', label: 'Kabul' },
                    rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Red' },
                    reviewed: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'İncelendi' }
                }[report.status];

                return <span className={`${config.bg} ${config.text} text-xs px-2 py-1 rounded font-bold`}>{config.label}</span>;
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
                            <button onClick={() => { updateReportStatus(report.id, 'accepted'); showToast('success', 'Kabul edildi'); }} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Kabul Et">
                                <Check size={18} />
                            </button>
                            <button onClick={() => { updateReportStatus(report.id, 'rejected'); showToast('info', 'Reddedildi'); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Reddet">
                                <XCircle size={18} />
                            </button>
                        </>
                    )}
                    <button onClick={() => { deleteReport(report.id); showToast('success', 'Silindi'); }} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg" title="Sil">
                        <Trash2 size={18} />
                    </button>
                </div>
            ),
            sortable: false,
            searchable: false
        }
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Hata Bildirimleri</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onClick={() => setReportFilter('all')} className={`p-4 rounded-xl border-2 transition-all ${reportFilter === 'all' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <div className="text-2xl font-black text-gray-900">{reportStats.total}</div>
                    <div className="text-sm font-bold text-gray-600">Toplam</div>
                </button>
                <button onClick={() => setReportFilter('pending')} className={`p-4 rounded-xl border-2 transition-all ${reportFilter === 'pending' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <div className="text-2xl font-black text-orange-700">{reportStats.pending}</div>
                    <div className="text-sm font-bold text-orange-600">Bekliyor</div>
                </button>
                <button onClick={() => setReportFilter('accepted')} className={`p-4 rounded-xl border-2 transition-all ${reportFilter === 'accepted' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <div className="text-2xl font-black text-green-700">{reportStats.accepted}</div>
                    <div className="text-sm font-bold text-green-600">Kabul</div>
                </button>
                <button onClick={() => setReportFilter('rejected')} className={`p-4 rounded-xl border-2 transition-all ${reportFilter === 'rejected' ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <div className="text-2xl font-black text-red-700">{reportStats.rejected}</div>
                    <div className="text-sm font-bold text-red-600">Red</div>
                </button>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <DataTable data={filteredReports} columns={reportColumns} keyExtractor={(report) => report.id} emptyMessage="Henüz hata bildirimi yok" searchPlaceholder="Rapor ara..." />
            </div>
        </div>
    );
};
