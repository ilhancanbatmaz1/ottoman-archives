import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, AlertCircle, CheckCircle, Save } from 'lucide-react';
import { SEO } from '../../components/SEO';

export const ResetPasswordPage = () => {
    const { updatePassword } = useAuth();
    const navigate = useNavigate();

    // If we are here, Supabase should have handled the session recovery from the URL fragment
    // But we check just in case or show a generic UI

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Optional: Redirect if not authenticated (meaning link was invalid or expired)
        // However, Supabase sometimes sets the session async, so we might wait a bit or let the user try
        const checkSession = async () => {
            // In a real app we might verify session here
        };
        checkSession();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            setStatus('error');
            setMessage('Şifre en az 6 karakter olmalıdır');
            return;
        }

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Şifreler eşleşmiyor');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            const result = await updatePassword(password);
            if (result.success) {
                setStatus('success');
                setMessage('Şifreniz başarıyla güncellendi! Yönlendiriliyorsunuz...');
                setTimeout(() => {
                    navigate('/progress'); // Or login, but usually they are logged in now
                }, 2000);
            } else {
                setStatus('error');
                setMessage(result.message || 'Şifre güncellenemedi. Lütfen tekrar deneyin.');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Beklenmedik bir hata oluştu');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex flex-col items-center justify-center p-6">
            <SEO title="Yeni Şifre Belirle" description="Hesabınız için yeni bir şifre oluşturun." />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock size={32} className="text-amber-600" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900">Yeni Şifre</h1>
                    <p className="text-gray-500 mt-2">
                        Lütfen yeni şifrenizi belirleyin
                    </p>
                </div>

                {status === 'error' && (
                    <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-3 mb-6">
                        <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{message}</p>
                    </div>
                )}

                {status === 'success' ? (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-6 text-center">
                        <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-green-800 mb-2">Başarılı!</h3>
                        <p className="text-green-700 text-sm">
                            {message}
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Yeni Şifre</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Şifre Tekrar</label>
                            <div className="relative">
                                <CheckCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full py-4 bg-amber-600 text-white rounded-xl font-bold text-lg hover:bg-amber-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
                        >
                            <Save size={20} />
                            {status === 'loading' ? 'Kaydediliyor...' : 'Şifreyi Güncelle'}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
};
