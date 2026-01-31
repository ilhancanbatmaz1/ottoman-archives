import { useState } from 'react';
import { Upload, Plus, Save, X, Image as ImageIcon, MousePointer } from 'lucide-react';
import { useDocuments } from '../../../context/DocumentContext';
import { useToast } from '../../../context/ToastContext';
import { CoordinatePicker } from '../../CoordinatePicker';
import type { WordToken, WordCoords } from '../../../data/documents';
import { supabase } from '../../../lib/supabase';

export const DocumentUpload = () => {
    const { addDocument } = useDocuments();
    const { showToast } = useToast();

    // Form State for Upload
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Ferman');
    const [difficulty, setDifficulty] = useState<'Kolay' | 'Orta' | 'Zor'>('Orta');
    const [year, setYear] = useState<number>(1900);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageFile, setImageFile] = useState<string | null>(null);
    const [tokens, setTokens] = useState<WordToken[]>([]);
    const [editingTokenId, setEditingTokenId] = useState<string | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validation
            if (file.size > 5 * 1024 * 1024) { // 5MB
                showToast('error', 'Dosya boyutu 5MB\'dan küçük olmalıdır.');
                return;
            }
            if (!file.type.startsWith('image/')) {
                showToast('error', 'Sadece resim dosyaları yüklenebilir.');
                return;
            }

            setSelectedFile(file);

            // Preview
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

    const uploadImageToSupabase = async (file: File): Promise<string> => {
        console.log('🔄 Upload başlatılıyor...', { fileName: file.name, size: file.size });

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        // Timeout protection
        const uploadPromise = supabase.storage
            .from('document-images')
            .upload(filePath, file);

        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Upload timeout (30s)')), 30000);
        });

        const { data: uploadData, error: uploadError } = await Promise.race([
            uploadPromise,
            timeoutPromise
        ]) as any;

        console.log('📤 Upload sonucu:', { uploadData, uploadError });

        if (uploadError) {
            console.error('❌ Upload hatası:', uploadError);
            if (uploadError.message?.includes('Bucket not found')) {
                throw new Error('Supabase Storage\'da "document-images" bucket bulunamadı. Lütfen Supabase Dashboard → Storage → Create Bucket → "document-images" oluşturun.');
            }
            throw new Error(`Görsel yüklenemedi: ${uploadError.message}`);
        }

        const { data } = supabase.storage
            .from('document-images')
            .getPublicUrl(filePath);

        console.log('✅ Public URL alındı:', data.publicUrl);
        return data.publicUrl;
    };

    const handleSave = async () => {
        if (!title || !imageFile || !selectedFile) {
            showToast('error', 'Lütfen başlık ve görsel ekleyin.');
            return;
        }

        try {
            setUploading(true);
            showToast('info', 'Görsel yükleniyor...');

            // 1. Upload Image to Supabase Storage
            const publicUrl = await uploadImageToSupabase(selectedFile);

            // 2. Save Document Metadata
            await addDocument({
                id: Date.now().toString(),
                title,
                category,
                difficulty,
                year,
                date: new Date().toLocaleDateString('tr-TR'),
                description: 'Eklenen Belge',
                imageUrl: publicUrl,
                isPremium: false, // Always free
                tokens
            });

            showToast('success', 'Belge başarıyla yayınlandı!');

            // Reset form
            setTitle('');
            setCategory('Ferman');
            setDifficulty('Orta');
            setYear(1900);
            setImageFile(null);
            setSelectedFile(null);
            setTokens([]);
            setEditingTokenId(null);
        } catch (error: any) {
            console.error('Save error:', error);
            showToast('error', error.message || 'Belge kaydedilirken bir hata oluştu');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 lg:col-span-1 h-fit">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Yeni Belge Ekle</h2>
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

                    <button onClick={handleSave} disabled={uploading} className={`w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black shadow-lg shadow-gray-200 flex items-center justify-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {uploading ? (
                            <>Görsel Yükleniyor...</>
                        ) : (
                            <><Save size={18} /> Belgeyi Yayınla</>
                        )}
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
    );
};
