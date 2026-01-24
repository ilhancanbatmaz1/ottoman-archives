import { useState, useEffect } from 'react';
import { useContentContext } from '../../../context/ContentContext';
import { ContentService, type SiteContent } from '../../../services/ContentService';
import { Loader2, Edit2, Check, X, AlertTriangle } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

export const ContentManager = () => {
    // Debug Mode: If context fails, we want to know
    const context = useContentContext();
    const { refreshContent } = context;
    const { showToast } = useToast();

    const [contents, setContents] = useState<SiteContent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const data = await ContentService.getAllContent();
            setContents(data);
            setError(null);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Veri yüklenirken hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (item: SiteContent) => {
        setEditingKey(item.key);
        setEditValue(item.value);
    };

    const handleCancel = () => {
        setEditingKey(null);
        setEditValue('');
    };

    const handleSave = async (key: string) => {
        try {
            const result = await ContentService.updateContent(key, editValue);

            if (result.success) {
                showToast('success', 'İçerik güncellendi');
                setEditingKey(null);
                setContents(prev => prev.map(item =>
                    item.key === key ? { ...item, value: editValue } : item
                ));
                await refreshContent();
            } else {
                showToast('error', 'Hata: ' + result.error);
            }
        } catch (err: any) {
            showToast('error', 'Beklenmedik hata: ' + err.message);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center">
                <div className="bg-red-50 text-red-600 p-4 rounded-xl inline-block mb-4">
                    <AlertTriangle size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Bir şeyler ters gitti</h3>
                <p className="text-gray-600">{error}</p>
                <button onClick={loadData} className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg">Tekrar Dene</button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-900">İçerik Yönetimi (CMS)</h1>
                <p className="text-gray-500">Site üzerindeki metinleri buradan yönetebilirsiniz.</p>
            </header>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-900">Başlık / Konum</th>
                                <th className="px-6 py-4 font-semibold text-gray-900">İçerik</th>
                                <th className="px-6 py-4 font-semibold text-gray-900 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {contents.map((item) => (
                                <tr key={item.key} className="hover:bg-gray-50 group">
                                    <td className="px-6 py-4 align-top w-1/4">
                                        <div className="font-medium text-gray-900">{item.key}</div>
                                        <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                                        <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mt-2 bg-gray-100 inline-block px-2 py-0.5 rounded">
                                            {item.category}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        {editingKey === item.key ? (
                                            <textarea
                                                className="w-full min-h-[100px] p-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-sm"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                            />
                                        ) : (
                                            <div className="text-gray-600 whitespace-pre-wrap font-mono text-xs bg-gray-50 p-2 rounded border border-gray-100 max-h-32 overflow-y-auto">
                                                {item.value}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 align-top text-right w-32">
                                        {editingKey === item.key ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleSave(item.key)}
                                                    className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                                    title="Kaydet"
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <button
                                                    onClick={handleCancel}
                                                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                                    title="İptal"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                title="Düzenle"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        {contents.length === 0 && (
                            <tbody className="divide-y divide-gray-100">
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                        <p>Henüz içerik bulunamadı veya veritabanı boş.</p>
                                        <p className="text-xs mt-2 text-amber-600">Lütfen cms_setup.sql dosyasını çalıştırdığınızdan emin olun.</p>
                                    </td>
                                </tr>
                            </tbody>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
};
