import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Eye, Trash2 } from 'lucide-react';
import { useAuth, type User } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { DataTable, type Column } from '../DataTable';

export const UserManager = () => {
    const { users, deleteUserById } = useAuth();
    const { showToast } = useToast();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [deleteUserConfirmId, setDeleteUserConfirmId] = useState<string | null>(null);

    const totalUsers = users.length;

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

    return (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Kullanıcı Listesi</h2>
                    <p className="text-gray-500 text-sm">Sisteme kayıtlı kullanıcıları yönetin.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
                    <UserCheck size={20} className="text-blue-600" />
                    <span className="font-bold text-blue-900">{totalUsers} Kullanıcı</span>
                </div>
            </div>
            <DataTable data={users} columns={userColumns} keyExtractor={(user) => user.id} emptyMessage="Henüz kayıtlı kullanıcı yok" searchPlaceholder="Kullanıcı ara..." />

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
        </div>
    );
};
