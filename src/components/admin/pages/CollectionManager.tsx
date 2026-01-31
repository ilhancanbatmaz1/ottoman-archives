// Simplified Collection Manager - CRUD for collections
// Full featured version with drag-drop document assignment will come later

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, BookOpen, Save, X } from 'lucide-react';
import { CollectionService } from '../../../services/CollectionService';
import type { Collection } from '../../../types/collection';

export default function CollectionManager() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

    // Form state
    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formIcon, setFormIcon] = useState('📚');
    const [formDifficulty, setFormDifficulty] = useState<'Kolay' | 'Orta' | 'Zor' | null>(null);
    const [formOrderIndex, setFormOrderIndex] = useState(0);
    const [formIsPublic, setFormIsPublic] = useState(true);

    useEffect(() => {
        loadCollections();
    }, []);

    const loadCollections = async () => {
        setLoading(true);
        const data = await CollectionService.getAllCollectionsAdmin();
        setCollections(data);
        setLoading(false);
    };

    const resetForm = () => {
        setFormTitle('');
        setFormDescription('');
        setFormIcon('📚');
        setFormDifficulty(null);
        setFormOrderIndex(collections.length);
        setFormIsPublic(true);
        setEditingCollection(null);
    };

    const handleCreate = async () => {
        if (!formTitle.trim()) {
            alert('Başlık gerekli');
            return;
        }

        const success = await CollectionService.createCollection({
            title: formTitle,
            description: formDescription || null,
            icon: formIcon,
            difficulty: formDifficulty,
            order_index: formOrderIndex,
            is_public: formIsPublic,
        });

        if (success) {
            setShowCreateModal(false);
            resetForm();
            loadCollections();
        } else {
            alert('Koleksiyon oluşturulamadı');
        }
    };

    const handleEdit = (collection: Collection) => {
        setEditingCollection(collection);
        setFormTitle(collection.title);
        setFormDescription(collection.description || '');
        setFormIcon(collection.icon);
        setFormDifficulty(collection.difficulty);
        setFormOrderIndex(collection.order_index);
        setFormIsPublic(collection.is_public);
        setShowCreateModal(true);
    };

    const handleUpdate = async () => {
        if (!editingCollection) return;

        const success = await CollectionService.updateCollection(editingCollection.id, {
            title: formTitle,
            description: formDescription,
            icon: formIcon,
            difficulty: formDifficulty,
            order_index: formOrderIndex,
            is_public: formIsPublic,
        });

        if (success) {
            setShowCreateModal(false);
            resetForm();
            loadCollections();
        } else {
            alert('Koleksiyon güncellenemedi');
        }
    };

    const handleDelete = async (collectionId: string, collectionTitle: string) => {
        if (!confirm(`"${collectionTitle}" koleksiyonunu silmek istediğinize emin misiniz?`)) {
            return;
        }

        const success = await CollectionService.deleteCollection(collectionId);
        if (success) {
            loadCollections();
        } else {
            alert('Koleksiyon silinemedi');
        }
    };

    const iconOptions = ['📚', '📖', '🏆', '📜', '💰', '⚔️', '🏛️', '📯', '🎖️', '🗺️'];

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Koleksiyon Yönetimi</h2>
                    <p className="text-gray-600 text-sm">Belge koleksiyonlarını düzenleyin</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowCreateModal(true);
                    }}
                    className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-700 transition-colors"
                >
                    <Plus size={18} />
                    Yeni Koleksiyon
                </button>
            </div>

            {/* Collections List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : collections.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <BookOpen size={48} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">Henüz koleksiyon yok</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {collections.map((collection) => (
                        <motion.div
                            key={collection.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="text-4xl">{collection.icon}</div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-gray-900">{collection.title}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{collection.description}</p>
                                        <div className="flex items-center gap-3 mt-3">
                                            {collection.difficulty && (
                                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium">
                                                    {collection.difficulty}
                                                </span>
                                            )}
                                            <span className="text-xs text-gray-500">
                                                {collection.document_count || 0} belge
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                Sıra: {collection.order_index}
                                            </span>
                                            {!collection.is_public && (
                                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-medium">
                                                    Taslak
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEdit(collection)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Düzenle"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(collection.id, collection.title)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Sil"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingCollection ? 'Koleksiyonu Düzenle' : 'Yeni Koleksiyon'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    resetForm();
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Başlık *
                                </label>
                                <input
                                    type="text"
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    placeholder="Başlangıç Paketi"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Açıklama
                                </label>
                                <textarea
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    placeholder="Yeni başlayanlar için seçilmiş belgeler..."
                                />
                            </div>

                            {/* Icon */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    İkon
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {iconOptions.map((icon) => (
                                        <button
                                            key={icon}
                                            onClick={() => setFormIcon(icon)}
                                            className={`text-3xl p-2 rounded-lg border-2 transition-all ${formIcon === icon
                                                    ? 'border-amber-500 bg-amber-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Difficulty */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Zorluk
                                </label>
                                <select
                                    value={formDifficulty || ''}
                                    onChange={(e) => setFormDifficulty(e.target.value as any || null)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                >
                                    <option value="">Seçiniz</option>
                                    <option value="Kolay">Kolay</option>
                                    <option value="Orta">Orta</option>
                                    <option value="Zor">Zor</option>
                                </select>
                            </div>

                            {/* Order Index */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sıra
                                </label>
                                <input
                                    type="number"
                                    value={formOrderIndex}
                                    onChange={(e) => setFormOrderIndex(parseInt(e.target.value) || 0)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>

                            {/* Is Public */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isPublic"
                                    checked={formIsPublic}
                                    onChange={(e) => setFormIsPublic(e.target.checked)}
                                    className="w-4 h-4 text-amber-600 rounded focus:ring-2 focus:ring-amber-500"
                                />
                                <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                                    Yayında (kullanıcılar görebilir)
                                </label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    resetForm();
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={editingCollection ? handleUpdate : handleCreate}
                                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Save size={18} />
                                {editingCollection ? 'Güncelle' : 'Oluştur'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
