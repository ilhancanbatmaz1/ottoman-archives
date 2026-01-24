import { useState } from 'react';
import { Plus, Trash2, Download, Save, Image as ImageIcon, Map, ChevronRight } from 'lucide-react';
import type { WordToken, WordCoords } from '../data/documents';
import { CoordinatePicker } from './CoordinatePicker';

export const ManualEntry = () => {
    const [tokens, setTokens] = useState<Partial<WordToken>[]>([]);
    const [docMeta, setDocMeta] = useState({ title: '', date: '', category: '', imageUrl: '' });
    const [mappingIndex, setMappingIndex] = useState<number | null>(null);

    const addToken = () => {
        setTokens([...tokens, { id: Date.now().toString(), original: '', modern: '', note: '' }]);
    };

    const updateToken = (index: number, field: keyof WordToken, value: any) => {
        const newTokens = [...tokens];
        newTokens[index] = { ...newTokens[index], [field]: value };
        setTokens(newTokens);
    };

    const removeToken = (index: number) => {
        setTokens(tokens.filter((_, i) => i !== index));
    };

    const handleCoordsSelected = (coords: WordCoords) => {
        if (mappingIndex !== null) {
            updateToken(mappingIndex, 'coords', coords);
            setMappingIndex(null);
        }
    };

    const exportDocument = () => {
        const fullDoc = {
            ...docMeta,
            id: Date.now().toString(),
            tokens: tokens as WordToken[],
            description: ''
        };
        const blob = new Blob([JSON.stringify(fullDoc, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${docMeta.title || 'belge'}.json`;
        link.click();
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Veri Girişi */}
            <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-100 p-2 rounded-lg text-amber-700"><Save size={24} /></div>
                        <h2 className="text-2xl font-bold">Belge Düzenleyici</h2>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={addToken} className="btn btn-primary text-xs uppercase tracking-wider">
                            <Plus size={16} /> Kelime Ekle
                        </button>
                        <button onClick={exportDocument} className="btn btn-outline text-xs uppercase tracking-wider">
                            <Download size={16} /> JSON Çıktısı
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Belge Başlığı</label>
                        <input
                            type="text"
                            value={docMeta.title}
                            onChange={(e) => setDocMeta({ ...docMeta, title: e.target.value })}
                            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:border-amber-700"
                            placeholder="Örn: Tanzimat Fermanı"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Görsel Adresi (URL)</label>
                        <input
                            type="text"
                            value={docMeta.imageUrl}
                            onChange={(e) => setDocMeta({ ...docMeta, imageUrl: e.target.value })}
                            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:border-amber-700"
                            placeholder="https://...belge.jpg"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="grid grid-cols-12 gap-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                        <div className="col-span-1">No</div>
                        <div className="col-span-4 text-right">Osmanlıca</div>
                        <div className="col-span-4">Türkçe</div>
                        <div className="col-span-2 text-center">Eşle</div>
                        <div className="col-span-1"></div>
                    </div>

                    {tokens.map((token, index) => (
                        <div key={token.id} className={`grid grid-cols-12 gap-4 items-center p-3 rounded-xl border transition-all ${mappingIndex === index ? 'border-amber-600 bg-amber-50 ring-2 ring-amber-600/10' : 'border-gray-50 bg-gray-50/50'} group`}>
                            <div className="col-span-1 text-sm font-bold text-gray-400">{index + 1}</div>
                            <div className="col-span-4">
                                <input
                                    value={token.original}
                                    onChange={(e) => updateToken(index, 'original', e.target.value)}
                                    className="w-full script-font text-right p-2.5 bg-white border border-gray-200 rounded-md text-xl outline-none focus:border-amber-700"
                                    dir="rtl"
                                />
                            </div>
                            <div className="col-span-4">
                                <input
                                    value={token.modern}
                                    onChange={(e) => updateToken(index, 'modern', e.target.value)}
                                    className="w-full p-2.5 bg-white border border-gray-200 rounded-md text-sm font-semibold outline-none focus:border-amber-700"
                                />
                            </div>
                            <div className="col-span-2 flex justify-center">
                                <button
                                    onClick={() => setMappingIndex(mappingIndex === index ? null : index)}
                                    className={`p-2 rounded-md transition-all ${token.coords ? 'text-amber-700' : 'text-gray-300'} ${mappingIndex === index ? 'bg-amber-700 text-white' : 'hover:bg-gray-100'}`}
                                >
                                    <Map size={18} />
                                </button>
                            </div>
                            <div className="col-span-1 flex justify-end">
                                <button onClick={() => removeToken(index)} className="p-2 text-red-400 opacity-20 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {tokens.length === 0 && (
                        <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                            <p className="text-gray-400 italic">Düzenlemeye başlamak için "Kelime Ekle" butonuna basın.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Görsel Eşleştirme */}
            <div className="w-full lg:w-[400px]">
                <div className="sticky top-24 space-y-4">
                    <div className="text-sm font-bold text-gray-900 border-l-4 border-amber-700 pl-4 mb-4">Görsel Üzerinde İşaretle</div>
                    {docMeta.imageUrl ? (
                        <div className="space-y-4">
                            <CoordinatePicker
                                imageUrl={docMeta.imageUrl}
                                onCoordsSelected={handleCoordsSelected}
                            />
                            {mappingIndex !== null && (
                                <div className="p-4 bg-amber-700 text-white text-xs font-bold rounded-lg flex items-center justify-between shadow-xl animate-pulse">
                                    <span>KELİME #{mappingIndex + 1} İŞARETLENİYOR</span>
                                    <ChevronRight size={16} />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-12 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center gap-4 text-center">
                            <ImageIcon size={48} className="text-gray-200" />
                            <p className="text-xs text-gray-400 italic px-8">Eşleştirme yapmak için bir görsel URL'si girin.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
