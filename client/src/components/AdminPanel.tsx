import React, { useState } from 'react';
import { Plus, Save, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { useDictionary } from '../hooks/useDictionary';

export const AdminPanel = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');

    const [turkish, setTurkish] = useState('');
    const [ottoman, setOttoman] = useState('');
    const [category, setCategory] = useState('GENERAL');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const { addWord } = useDictionary();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'ilhan123') {
            setIsAuthenticated(true);
            setAuthError('');
        } else {
            setAuthError('Hatalı şifre!');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('idle');

        if (!turkish || !ottoman) {
            setStatus('error');
            setMessage('Lütfen Türkçe ve Osmanlıca alanlarını doldurunuz.');
            return;
        }

        try {
            await addWord(turkish, ottoman, category);
            setStatus('success');
            setMessage(`"${turkish}" kelimesi başarıyla eklendi.`);
            setTurkish('');
            setOttoman('');
        } catch (err: any) {
            setStatus('error');
            setMessage('Hata: ' + err.message);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
                <div className="bg-white p-8 rounded-xl shadow-md border border-stone-200 w-full max-w-sm">
                    <div className="flex flex-col items-center mb-6 text-stone-700">
                        <div className="bg-amber-100 p-3 rounded-full mb-3">
                            <Lock size={24} className="text-amber-800" />
                        </div>
                        <h2 className="text-xl font-bold">Admin Girişi</h2>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-stone-500 uppercase">Şifre</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                placeholder="••••••••"
                            />
                        </div>

                        {authError && (
                            <div className="text-red-600 text-sm flex items-center gap-2">
                                <AlertCircle size={14} /> {authError}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-amber-800 text-white font-bold py-3 rounded-lg hover:bg-amber-900 transition-colors"
                        >
                            Giriş Yap
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-100 p-6">
            <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                <div className="flex items-center gap-3 mb-6 border-b pb-4 text-stone-700">
                    <Plus size={24} />
                    <div>
                        <h2 className="text-lg font-bold">Yeni Kelime Ekle</h2>
                        <p className="text-xs text-stone-500">Veritabanına yeni bir kelime girişi yapın.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-500 uppercase">Türkçe (Latin)</label>
                        <input
                            value={turkish}
                            onChange={(e) => setTurkish(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                            placeholder="Örn: Kitap"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-500 uppercase">Osmanlıca (Arap Harfli)</label>
                        <input
                            value={ottoman}
                            onChange={(e) => setOttoman(e.target.value)}
                            dir="rtl"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none font-matbu text-xl"
                            placeholder="Örn: كتاب"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-500 uppercase">Kategori</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                        >
                            <option value="GENERAL">Genel</option>
                            <option value="ZAMIR">Zamirler</option>
                            <option value="FIIL">Fiiller</option>
                            <option value="ZAMAN">Zaman</option>
                            <option value="IDARI">İdari/Siyasi</option>
                            <option value="AILE">Aile/Toplum</option>
                            <option value="SOYUT">Soyut/Akademik</option>
                            <option value="SIFAT">Sıfatlar</option>
                            <option value="DINI">Dini Terimler</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-amber-700 text-white font-bold py-3 rounded-lg hover:bg-amber-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <Save size={18} />
                        Kaydet
                    </button>

                    {status === 'success' && (
                        <div className="p-3 bg-green-50 text-green-800 rounded-lg flex items-center gap-2 text-sm">
                            <CheckCircle size={16} /> {message}
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="p-3 bg-red-50 text-red-800 rounded-lg flex items-center gap-2 text-sm">
                            <AlertCircle size={16} /> {message}
                        </div>
                    )}
                </form>
            </div >
        </div >
    );
};
