import { useState } from 'react';
import { Upload, Plus, Save, X, Image as ImageIcon, MousePointer, Trash2, FileText, MessageSquare, Check, XCircle, Users, BarChart3, AlertTriangle, History, Activity } from 'lucide-react';
import { useDocuments } from '../../context/DocumentContext';
import { useFeedback } from '../../context/FeedbackContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { CoordinatePicker } from '../CoordinatePicker';
import { AdminLayout } from './AdminLayout';
import { DataTable, type Column } from './DataTable';
import { StatCard } from './StatCard';
import type { WordToken, WordCoords } from '../../data/documents';
import type { ErrorReport } from '../../context/FeedbackContext';
import type { User } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { TrendingUp, BookOpen, UserCheck, Eye } from 'lucide-react';

export const AdminDashboard = () => {
    const { documents, addDocument, deleteDocument } = useDocuments();
    const { errorReports, updateReportStatus, deleteReport, getPendingCount } = useFeedback();
    const { users, deleteUserById } = useAuth();
    const { showToast } = useToast();
    const { getActivityLogs } = useAdminAuth();

    // Tab State
    const [activeTab, setActiveTab] = useState<'dashboard' | 'upload' | 'documents' | 'users' | 'reports' | 'logs'>('dashboard');

    // Form State for Upload
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Ferman');
    const [difficulty, setDifficulty] = useState<'Kolay' | 'Orta' | 'Zor'>('Orta');
    const [year, setYear] = useState<number>(1900);
    const [imageFile, setImageFile] = useState<string | null>(null);
    const [tokens, setTokens] = useState<WordToken[]>([]);
    const [editingTokenId, setEditingTokenId] = useState<string | null>(null);

    // User management
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [deleteUserConfirmId, setDeleteUserConfirmId] = useState<string | null>(null);

    // Document management
    const [deleteDocConfirmId, setDeleteDocConfirmId] = useState<string | null>(null);

    // Reports filter
    const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageFile(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const addNewToken = () => {
        const newToken: WordToken = {
            id: Date.now().toString(),
            original: '',
            modern: '',
            note: ''
        };
        setTokens([...tokens, newToken]);
        setEditingTokenId(newToken.id);
    };

    const updateToken = (id: string, field: keyof WordToken, value: any) => {
        setTokens(tokens.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    const handleCoordsSelected = (coords: WordCoords) => {
        if (editingTokenId) {
            updateToken(editingTokenId, 'coords', coords);
            setEditingTokenId(null);
        }
    };

    const handleSave = () => {
        if (!title || !imageFile) {
            showToast('error', 'Lütfen başlık ve görsel ekleyin.');
            return;
        }

        addDocument({
            id: Date.now().toString(),
            title,
            category,
            difficulty,
            year,
            date: new Date().toLocaleDateString('tr-TR'),
            description: 'Eklenen Belge',
            imageUrl: imageFile,
            tokens
        });

        showToast('success', 'Belge başarıyla kaydedildi!');

        // Reset form
        setTitle('');
        setCategory('Ferman');
        setDifficulty('Orta');
        setYear(1900);
        setImageFile(null);
        setTokens([]);
        setEditingTokenId(null);
    };

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

    // User columns
    const userColumns: Column<User>[] = [
        {
            key: 'fullName',
            header: 'Ad Soyad',
            render: (user) => <div className="font-bold text-gray-900">{user.fullName}</div>
        },
        {
            key: 'username',
            header: 'Kullanıcı Adı',
            render: (user) => <div className="text-gray-600">@{user.username}</div>
        },
        {
            key: 'createdAt',
            header: 'Kayıt Tarihi',
            render: (user) => <div className="text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString('tr-TR')}</div>,
            sortable: true
        },
        {
            key: 'id',
            header: 'İşlemler',
            render: (user) => (
                <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedUser(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Detayları Gör">
                        <Eye size={18} />
                    </button>
                    <button onClick={() => setDeleteUserConfirmId(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Kullanıcıyı Sil">
                        <Trash2 size={18} />
                    </button>
                </div>
            ),
            sortable: false,
            searchable: false
        }
    ];

    // Report columns
    const filteredReports = reportFilter === 'all' ? errorReports : errorReports.filter(r => r.status === reportFilter);

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

    const reportStats = {
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
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Admin Paneli</h1>
                    <p className="text-gray-500">Tüm yönetim işlemlerini bu sayfadan yapabilirsiniz</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setActiveTab('dashboard')} className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-amber-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                        <BarChart3 size={18} /> Dashboard
                    </button>
                    <button onClick={() => setActiveTab('upload')} className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'upload' ? 'bg-amber-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                        <Plus size={18} /> Yeni Belge
                    </button>
                    <button onClick={() => setActiveTab('documents')} className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'documents' ? 'bg-amber-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                        <FileText size={18} /> Belgeler ({totalDocuments})
                    </button>
                    <button onClick={() => setActiveTab('users')} className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-amber-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                        <Users size={18} /> Kullanıcılar ({totalUsers})
                    </button>
                    <button onClick={() => setActiveTab('reports')} className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'reports' ? 'bg-orange-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                        <MessageSquare size={18} /> Hata Raporları
                        {pendingReports > 0 && <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{pendingReports}</span>}
                    </button>
                    <button onClick={() => setActiveTab('logs')} className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'logs' ? 'bg-gray-800 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                        <History size={18} /> Aktivite Logları
                    </button>
                </div>

                {/* Tab Content */}

                {/* DASHBOARD TAB */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
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
                )}

                {/* UPLOAD TAB */}
                {activeTab === 'upload' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 lg:col-span-1 h-fit">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Belge Görseli</label>
                                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                        <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                        {imageFile ? (
                                            <div className="flex items-center justify-center gap-2 text-green-600 font-bold">
                                                <ImageIcon size={20} />Görsel Yüklendi
                                            </div>
                                        ) : (
                                            <div className="text-gray-400">
                                                <Upload size={24} className="mx-auto mb-2" />
                                                <span className="text-sm">Görsel Seç (JPG/PNG)</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Başlık</label>
                                    <input value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-amber-500" placeholder="Örn: Tapu Senedi" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Belge Türü</label>
                                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-amber-500">
                                        <option>Ferman</option>
                                        <option>Berat</option>
                                        <option>Mektup</option>
                                        <option>Tapu</option>
                                        <option>Siyasi</option>
                                        <option>Edebi</option>
                                        <option>Hukuki</option>
                                        <option>Diğer</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Zorluk</label>
                                        <select value={difficulty} onChange={e => setDifficulty(e.target.value as any)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-amber-500">
                                            <option value="Kolay">Kolay</option>
                                            <option value="Orta">Orta</option>
                                            <option value="Zor">Zor</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Yıl</label>
                                        <input type="number" value={year} onChange={e => setYear(parseInt(e.target.value))} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-amber-500" placeholder="1900" />
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-gray-900">Kelimeler</h3>
                                        <button onClick={addNewToken} className="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors">
                                            <Plus size={16} />
                                        </button>
                                    </div>

                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                        {tokens.map((token, idx) => (
                                            <div key={token.id} className={`p-3 rounded-lg border transition-all ${editingTokenId === token.id ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-100' : 'border-gray-200 bg-white'}`}>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => setEditingTokenId(token.id)} className={`text-xs px-2 py-1 rounded ${token.coords ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                                            {token.coords ? 'Konum Var' : 'Konum Seç'}
                                                        </button>
                                                        <button onClick={() => setTokens(tokens.filter(t => t.id !== token.id))} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                                                    </div>
                                                </div>
                                                <input value={token.original} onChange={e => updateToken(token.id, 'original', e.target.value)} className="w-full mb-2 p-2 border border-gray-200 rounded script-font text-right text-lg" placeholder="Osmanlıca..." dir="rtl" />
                                                <input value={token.modern} onChange={e => updateToken(token.id, 'modern', e.target.value)} className="w-full p-2 border border-gray-200 rounded text-sm font-semibold" placeholder="Türkçe..." />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button onClick={handleSave} className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black shadow-lg shadow-gray-200 flex items-center justify-center gap-2">
                                    <Save size={18} /> Belgeyi Yayınla
                                </button>
                            </div>
                        </div>

                        <div className="lg:col-span-2 bg-gray-800 rounded-2xl p-4 overflow-hidden shadow-inner flex flex-col">
                            <div className="bg-gray-900 text-white px-4 py-2 rounded-lg mb-4 flex justify-between items-center">
                                <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                    <MousePointer size={14} />
                                    {editingTokenId ? 'Şimdi Seçilen Kelimeyi Çizerek İşaretleyin' : 'Listeden bir kelime seçin'}
                                </span>
                                {editingTokenId && <span className="text-xs bg-amber-600 px-2 py-1 rounded animate-pulse">Eşleştirme Modu Aktif</span>}
                            </div>

                            <div className="flex-1 bg-gray-700/50 rounded-xl overflow-auto flex items-center justify-center min-h-[500px]">
                                {imageFile ? (
                                    <div className="relative">
                                        <CoordinatePicker imageUrl={imageFile} onCoordsSelected={handleCoordsSelected} disabled={!editingTokenId} />
                                        {tokens.map(t => t.coords && (
                                            <div key={t.id} className="absolute border-2 border-green-500 bg-green-500/20 pointer-events-none" style={{ left: `${t.coords.x}%`, top: `${t.coords.y}%`, width: `${t.coords.width}%`, height: `${t.coords.height}%` }} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-gray-500 flex flex-col items-center">
                                        <ImageIcon size={48} className="mb-4 opacity-50" />
                                        <p>Görsel yüklenmedi</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* DOCUMENTS TAB */}
                {activeTab === 'documents' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Yayınlanmış Belgeler</h2>
                            <p className="text-gray-500 text-sm mt-1">Aşağıdaki belgeleri silebilirsiniz.</p>
                        </div>

                        {documents.length === 0 ? (
                            <div className="p-16 text-center text-gray-400">
                                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                                <p>Henüz belge eklenmemiş.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {documents.map(doc => (
                                    <div key={doc.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                                        <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                            <img src={doc.imageUrl} alt={doc.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 truncate">{doc.title}</h3>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold">{doc.category}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded font-bold ${doc.difficulty === 'Kolay' ? 'bg-green-50 text-green-700' : doc.difficulty === 'Orta' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>{doc.difficulty}</span>
                                                <span className="text-xs text-gray-400">{doc.year}</span>
                                                <span className="text-xs text-gray-400">• {doc.tokens.length} kelime</span>
                                            </div>
                                        </div>
                                        <button onClick={() => setDeleteDocConfirmId(doc.id)} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Belgeyi Sil">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* USERS TAB */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Kullanıcı Listesi</h2>
                            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
                                <UserCheck size={20} className="text-blue-600" />
                                <span className="font-bold text-blue-900">{totalUsers} Kullanıcı</span>
                            </div>
                        </div>
                        <DataTable data={users} columns={userColumns} keyExtractor={(user) => user.id} emptyMessage="Henüz kayıtlı kullanıcı yok" searchPlaceholder="Kullanıcı ara..." />
                    </div>
                )}

                {/* REPORTS TAB */}
                {activeTab === 'reports' && (
                    <div className="space-y-6">
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
                )}

                {/* LOGS TAB */}
                {activeTab === 'logs' && (
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Aktivite Logları</h2>
                            <div className="text-sm text-gray-500">Son 500 işlem</div>
                        </div>
                        <DataTable
                            data={getActivityLogs()}
                            columns={[
                                {
                                    key: 'timestamp',
                                    header: 'Zaman',
                                    render: (log) => <div className="text-sm text-gray-600">{new Date(log.timestamp).toLocaleString('tr-TR')}</div>,
                                    sortable: true
                                },
                                {
                                    key: 'action',
                                    header: 'İşlem',
                                    render: (log) => (
                                        <span className={`text-xs px-2 py-1 rounded font-bold ${log.action.includes('Login') ? 'bg-green-100 text-green-700' :
                                            log.action.includes('Delete') ? 'bg-red-100 text-red-700' :
                                                log.action.includes('Update') ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {log.action}
                                        </span>
                                    ),
                                    sortable: true
                                },
                                {
                                    key: 'details',
                                    header: 'Detaylar',
                                    render: (log) => <div className="text-sm text-gray-900">{log.details}</div>
                                }
                            ]}
                            keyExtractor={(log) => log.id}
                            emptyMessage="Henüz kayıtlı aktivite yok"
                            searchPlaceholder="Log ara..."
                        />
                    </div>
                )}
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <UserCheck size={32} className="text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedUser.fullName}</h3>
                            <p className="text-gray-500">@{selectedUser.username}</p>
                        </div>
                        <div className="space-y-3 mb-6">
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-xs font-bold text-gray-500 uppercase mb-1">Kullanıcı ID</div>
                                <div className="text-sm font-mono text-gray-900">{selectedUser.id}</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-xs font-bold text-gray-500 uppercase mb-1">Kayıt Tarihi</div>
                                <div className="text-sm text-gray-900">{new Date(selectedUser.createdAt).toLocaleString('tr-TR')}</div>
                            </div>
                        </div>
                        <button onClick={() => setSelectedUser(null)} className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">Kapat</button>
                    </motion.div>
                </div>
            )}

            {/* Delete User Confirmation */}
            {deleteUserConfirmId && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteUserConfirmId(null)}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={32} className="text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Kullanıcıyı Sil</h3>
                            <p className="text-gray-500">Bu işlem geri alınamaz.</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteUserConfirmId(null)} className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">Vazgeç</button>
                            <button onClick={async () => { await deleteUserById(deleteUserConfirmId); showToast('success', 'Kullanıcı silindi'); setDeleteUserConfirmId(null); }} className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                                <Trash2 size={18} /> Evet, Sil
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Delete Document Confirmation */}
            {deleteDocConfirmId && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteDocConfirmId(null)}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle size={32} className="text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Belgeyi Sil</h3>
                            <p className="text-gray-500">Bu işlem geri alınamaz.</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteDocConfirmId(null)} className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">Vazgeç</button>
                            <button onClick={() => { deleteDocument(deleteDocConfirmId); showToast('success', 'Belge silindi'); setDeleteDocConfirmId(null); }} className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                                <Trash2 size={18} /> Evet, Sil
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AdminLayout>
    );
};
