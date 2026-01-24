import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, AlertCircle, CheckCircle, KeyRound } from 'lucide-react';
import { SEO } from '../../components/SEO';

export const ForgotPasswordPage = () => {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setStatus('error');
            setMessage('Lütfen email adresinizi girin');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            const result = await resetPassword(email);
            if (result.success) {
                setStatus('success');
                setMessage('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen spam kutunuzu da kontrol edin.');
            } else {
                setStatus('error');
                setMessage(result.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Beklenmedik bir hata oluştu');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex flex-col">
            <SEO title="Şifremi Unuttum" description="Şifrenizi sıfırlamak için e-posta adresinizi girin." />

            <nav className="w-full p-6">
                <Link to="/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                    <ArrowLeft size={20} />
                    <span className="font-bold">Girişe Dön</span>
                </Link>
            </nav>

            <main className="flex-1 flex items-center justify-center px-6 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
                >
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <KeyRound size={32} className="text-amber-600" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900">Şifre Sıfırlama</h1>
                        <p className="text-gray-500 mt-2">
                            Hesabınıza bağlı e-posta adresini girin, size şifre yenileme bağlantısı gönderelim.
                        </p>
                    </div>

                    {status === 'error' && (
                        <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-3 mb-6">
                            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{message}</p>
                        </div>
                    )}

                    {status === 'success' ? (
                        <div className="text-center space-y-6">
                            <div className="bg-green-50 border border-green-100 rounded-xl p-6">
                                <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-green-800 mb-2">E-posta Gönderildi!</h3>
                                <p className="text-green-700 text-sm">
                                    {message}
                                </p>
                            </div>
                            <Link
                                to="/login"
                                className="block w-full py-4 bg-amber-600 text-white rounded-xl font-bold text-lg hover:bg-amber-700 active:scale-95 transition-all"
                            >
                                Giriş Ekranına Dön
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">E-posta Adresi</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                                        placeholder="ornek@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full py-4 bg-amber-600 text-white rounded-xl font-bold text-lg hover:bg-amber-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                            >
                                {status === 'loading' ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
                            </button>
                        </form>
                    )}
                </motion.div>
            </main>
        </div>
    );
};
