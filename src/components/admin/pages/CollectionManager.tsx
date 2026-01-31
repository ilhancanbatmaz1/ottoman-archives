// Collection Manager with Document Assignment Feature

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, BookOpen, Save, X, FileText, ChevronUp, ChevronDown } from 'lucide-react';
import { CollectionService } from '../../../services/CollectionService';
import { DocumentService } from '../../../services/DocumentService';
import type { Collection } from '../../../types/collection';

interface ArchivalDocument {
    id: string;
    title: string;
    imageUrl: string;
    difficulty: string;
    category: string;
}

export default function CollectionManager() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

    // Document assignment state
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [managingCollection, setManagingCollection] = useState<Collection | null>(null);
    const [allDocuments, setAllDocuments] = useState<ArchivalDocument[]>([]);
    const [assignedDocIds, setAssignedDocIds] = useState<string[]>([]);
    const [assignedDocsWithOrder, setAssignedDocsWithOrder] = useState<{ id: string, order: number }[]>([]);

    // Form state
    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formIcon, setFormIcon] = useState('📚');
    const [formDifficulty, setFormDifficulty] = useState<'Kolay' | 'Orta' | 'Zor' | null>(null);
    const [formOrderIndex, setFormOrderIndex] = useState(0);
    const [formIsPublic, setFormIsPublic] = useState(true);

    useEffect(() => {
        loadCollections();
        loadAllDocuments();
    }, []);

    const loadCollections = async () => {
        setLoading(true);
        const data = await CollectionService.getAllCollectionsAdmin();
        setCollections(data);
        setLoading(false);
    };

    const loadAllDocuments = async () => {
        // Get hardcoded documents
        const localDocs = DocumentService.getAllDocuments();

        // Get Supabase documents
        const supabaseDocs = await DocumentService.getAllDocumentsFromSupabase();

        // Merge and remove duplicates (prefer Supabase versions if ID matches)
        const allDocsMap = new Map<string, ArchivalDocument>();

        // Add local docs first
        localDocs.forEach(doc => allDocsMap.set(doc.id, doc));

        // Override with Supabase docs (they have priority)
        supabaseDocs.forEach(doc => allDocsMap.set(doc.id, doc));

        // Convert back to array and sort by title
        const mergedDocs = Array.from(allDocsMap.values()).sort((a, b) =>
            a.title.localeCompare(b.title, 'tr')
        );

        setAllDocuments(mergedDocs);
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

    // Document Assignment Functions
    const handleManageDocuments = async (collection: Collection) => {
        setManagingCollection(collection);
        setShowDocumentModal(true);

        // Load assigned documents for this collection
        const collectionData = await CollectionService.getCollectionById(collection.id);
        if (collectionData && collectionData.documents) {
            const docIds = collectionData.documents.map(d => d.id);
            const docsWithOrder = collectionData.documents.map((d, idx) => ({
                id: d.id,
                order: d.order_index !== undefined ? d.order_index : idx
            }));
            setAssignedDocIds(docIds);
            setAssignedDocsWithOrder(docsWithOrder);
        } else {
            setAssignedDocIds([]);
            setAssignedDocsWithOrder([]);
        }
    };

    const handleToggleDocument = async (docId: string) => {
        if (assignedDocIds.includes(docId)) {
            // Remove
            setAssignedDocIds(prev => prev.filter(id => id !== docId));
            setAssignedDocsWithOrder(prev => prev.filter(item => item.id !== docId));
        } else {
            // Add with next order index
            const nextOrder = assignedDocsWithOrder.length;
            setAssignedDocIds(prev => [...prev, docId]);
            setAssignedDocsWithOrder(prev => [...prev, { id: docId, order: nextOrder }]);
        }
    };

    const handleMoveDocument = (docId: string, direction: 'up' | 'down') => {
        const currentIndex = assignedDocsWithOrder.findIndex(item => item.id === docId);
        if (currentIndex === -1) return;

        const newOrder = [...assignedDocsWithOrder];
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (targetIndex < 0 || targetIndex >= newOrder.length) return;

        // Swap
        [newOrder[currentIndex], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[currentIndex]];

        // Update order values
        newOrder.forEach((item, idx) => {
            item.order = idx;
        });

        setAssignedDocsWithOrder(newOrder);
    };

    const handleSaveDocuments = async () => {
        if (!managingCollection) return;

        setLoading(true);

        // Get current documents in collection
        const currentCollection = await CollectionService.getCollectionById(managingCollection.id);
        const currentDocIds = currentCollection?.documents?.map(d => d.id) || [];

        // Find documents to remove
        const toRemove = currentDocIds.filter(id => !assignedDocIds.includes(id));

        // Find documents to add
        const toAdd = assignedDocIds.filter(id => !currentDocIds.includes(id));

        // Remove documents
        for (const docId of toRemove) {
            await CollectionService.removeDocumentFromCollection(managingCollection.id, docId);
        }

        // Add documents
        for (const item of assignedDocsWithOrder) {
            if (toAdd.includes(item.id)) {
                await CollectionService.addDocumentToCollection(managingCollection.id, item.id, item.order);
            }
        }

        // Update order for existing documents
        if (assignedDocsWithOrder.length > 0) {
            await CollectionService.reorderDocuments(
                managingCollection.id,
                assignedDocsWithOrder.map(item => ({ documentId: item.id, orderIndex: item.order }))
            );
        }

        setLoading(false);
        setShowDocumentModal(false);
        setManagingCollection(null);
        loadCollections();
        alert('Belgeler başarıyla güncellendi!');
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
                                        onClick={() => handleManageDocuments(collection)}
                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                        title="Belgeleri Yönet"
                                    >
                                        <FileText size={18} />
                                    </button>
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

            {/* Document Assignment Modal */}
            {showDocumentModal && managingCollection && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    Belge Yönetimi: {managingCollection.icon} {managingCollection.title}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {assignedDocIds.length} belge seçildi
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowDocumentModal(false);
                                    setManagingCollection(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Document List */}
                        <div className="space-y-3 mb-6">
                            <h4 className="font-semibold text-gray-900">Tüm Belgeler</h4>
                            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3">
                                {allDocuments.map((doc) => {
                                    const isAssigned = assignedDocIds.includes(doc.id);
                                    const orderInfo = assignedDocsWithOrder.find(item => item.id === doc.id);
                                    const currentIndex = assignedDocsWithOrder.findIndex(item => item.id === doc.id);

                                    return (
                                        <div
                                            key={doc.id}
                                            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isAssigned ? 'bg-green-50 border border-green-200' : 'bg-gray-50 hover:bg-gray-100'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isAssigned}
                                                onChange={() => handleToggleDocument(doc.id)}
                                                className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                                            />
                                            <img
                                                src={doc.imageUrl}
                                                alt={doc.title}
                                                className="w-12 h-12 object-cover rounded border border-gray-300"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{doc.title}</p>
                                                <p className="text-xs text-gray-500">{doc.difficulty} • {doc.category}</p>
                                            </div>
                                            {isAssigned && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                                                        Sıra: {(orderInfo?.order || 0) + 1}
                                                    </span>
                                                    <button
                                                        onClick={() => handleMoveDocument(doc.id, 'up')}
                                                        disabled={currentIndex === 0}
                                                        className="p-1 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30"
                                                    >
                                                        <ChevronUp size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleMoveDocument(doc.id, 'down')}
                                                        disabled={currentIndex === assignedDocsWithOrder.length - 1}
                                                        className="p-1 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30"
                                                    >
                                                        <ChevronDown size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDocumentModal(false);
                                    setManagingCollection(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleSaveDocuments}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Kaydediliyor...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Kaydet ({assignedDocIds.length} belge))
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
