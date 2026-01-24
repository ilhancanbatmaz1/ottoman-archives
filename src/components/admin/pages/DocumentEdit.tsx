import { useState, useEffect } from 'react';
import { Upload, Plus, Save, X, Image as ImageIcon, MousePointer, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocuments } from '../../../context/DocumentContext';
import { useToast } from '../../../context/ToastContext';
import { CoordinatePicker } from '../../CoordinatePicker';
import type { WordToken, WordCoords } from '../../../data/documents';
import { DocumentService } from '../../../services/DocumentService';

export const DocumentEdit = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { updateDocument } = useDocuments();
    const { showToast } = useToast();

    // Form State
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Ferman');
    const [difficulty, setDifficulty] = useState<'Kolay' | 'Orta' | 'Zor'>('Orta');
    const [year, setYear] = useState<number>(1900);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null); // For new uploads
    const [tokens, setTokens] = useState<WordToken[]>([]);
    const [editingTokenId, setEditingTokenId] = useState<string | null>(null);

    useEffect(() => {
        const loadDoc = async () => {
            if (!id) return;
            try {
                const doc = await DocumentService.getById(id);
                if (doc) {
                    setTitle(doc.title);
                    setCategory(doc.category || 'Ferman');
                    setDifficulty(doc.difficulty as any);
                    setYear(doc.year || 1900);
                    setImageUrl(doc.imageUrl);
                    setTokens(doc.tokens || []);
                } else {
                    showToast('error', 'Belge bulunamadı');
                    navigate('/admin/documents');
                }
            } catch (error) {
                console.error(error);
                showToast('error', 'Belge yüklenirken hata oluştu');
            } finally {
                setLoading(false);
            }
        };
        loadDoc();
    }, [id]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
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

    const handleSave = async () => {
        if (!title || !imageUrl) {
            showToast('error', 'Lütfen başlık ve görsel ekleyin.');
            return;
        }

        try {
            await updateDocument(id!, {
                title,
                category,
                difficulty,
                year,
                tokens,
                // Only sending imageUrl if changed or same, but DocumentService handles update logic
                ...(imageFile ? { imageUrl } : {})
            });

            // Note: In a real app with Supabase Storage, we would upload the new file here if changed
            // Currently DocumentService.uploadImage logic is tied to create, we might need a separate call if we were fully implementing image replacement flow.
            // For now, assuming hybrid/local usage pattern or existing URL preservation.

            showToast('success', 'Belge başarıyla güncellendi!');
            navigate('/admin/documents');
        } catch (error) {
            showToast('error', 'Güncelleme hatası');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 lg:col-span-1 h-fit">
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <button onClick={() => navigate('/admin/documents')} className="p-1 hover:bg-gray-100 rounded">
                            <ArrowLeft size={20} />
                        </button>
                        <h2 className="text-xl font-bold text-gray-900">Belgeyi Düzenle</h2>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Belge Görseli</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative overflow-hidden group">
                            <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" />
                            {imageUrl ? (
                                <div className="relative">
                                    <img src={imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-sm">Değiştir</div>
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
                        <Save size={18} /> Değişiklikleri Kaydet
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
                    {imageUrl ? (
                        <div className="relative">
                            <CoordinatePicker imageUrl={imageUrl} onCoordsSelected={handleCoordsSelected} disabled={!editingTokenId} />
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
    );
};
