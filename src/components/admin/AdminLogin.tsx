import { useState } from 'react';
import { Lock, ArrowRight, AlertTriangle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

export const AdminLogin = () => {
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login, isRateLimited, getRateLimitTimeRemaining } = useAdminAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Simulate network delay for security (prevent timing attacks)
            await new Promise(resolve => setTimeout(resolve, 800));

            const result = await login(password, rememberMe);

            if (result.success) {
                navigate('/admin/dashboard');
            } else {
                setError(result.message || 'Giriş başarısız');
                setPassword('');
            }
        } catch (err) {
            setError('Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    const remainingTime = getRateLimitTimeRemaining();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex justify-center mb-6">
                    <div className={`p-3 rounded-full ${isRateLimited ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                        {isRateLimited ? <AlertTriangle size={32} /> : <Lock size={32} />}
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Admin Girişi</h2>
                <p className="text-center text-gray-500 mb-8">
                    {isRateLimited
                        ? 'Çok fazla başarısız deneme yapıldı.'
                        : 'Devam etmek için yönetici şifresini girin.'}
                </p>

                {isRateLimited ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                        <div className="text-red-800 font-bold mb-2">Giriş Engellendi</div>
                        <div className="flex items-center justify-center gap-2 text-red-600">
                            <Clock size={16} />
                            <span className="font-mono text-xl">{Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}</span>
                        </div>
                        <p className="text-xs text-red-500 mt-2">Süre dolana kadar bekleyin.</p>
                    </div>
                ) : (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                                placeholder="Şifre..."
                                disabled={loading}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                            />
                            <label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer user-select-none">
                                Beni Hatırla
                            </label>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm font-bold text-center bg-red-50 py-2 rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !password}
                            className={`w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {loading ? 'Kontrol ediliyor...' : (
                                <>Giriş Yap <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>
                )}

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600 text-sm transition-colors">
                        ← Ana Sayfaya Dön
                    </button>
                </div>
            </div>
            {/* DEBUG INFO: REMOVE IN PRODUCTION LATER */}
            <div className="mt-8 text-center text-[10px] text-gray-300 font-mono">
                System Status: {import.meta.env.VITE_SUPABASE_URL ? 'Online' : 'Offline'} <br />
                Host: {import.meta.env.VITE_SUPABASE_URL?.slice(0, 15)}...
            </div>
        </div>
    );
};
