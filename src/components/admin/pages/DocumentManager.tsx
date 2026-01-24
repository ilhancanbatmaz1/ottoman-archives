import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Trash2, AlertTriangle, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDocuments } from '../../../context/DocumentContext';
import { useToast } from '../../../context/ToastContext';

export const DocumentManager = () => {
    const { documents, deleteDocument } = useDocuments();
    const { showToast } = useToast();
    const [deleteDocConfirmId, setDeleteDocConfirmId] = useState<string | null>(null);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Yayınlanmış Belgeler</h2>
                    <p className="text-gray-500 text-sm mt-1">Aşağıdaki belgeleri yönetebilirsiniz.</p>
                </div>
                <Link to="/admin/documents/new" className="px-4 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition-colors flex items-center gap-2">
                    <Plus size={18} />
                    Yeni Belge
                </Link>
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
                            <Link to={`/admin/documents/edit/${doc.id}`} className="p-3 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors" title="Düzenle">
                                <FileText size={20} />
                            </Link>
                        </div>
                    ))}
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
        </div>
    );
};
