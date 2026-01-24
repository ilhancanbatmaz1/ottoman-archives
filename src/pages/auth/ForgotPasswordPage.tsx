import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, AlertCircle, KeyRound, Send } from 'lucide-react';
import { ResetPasswordSchema, type ResetPasswordFormData } from '../../lib/validation';
import { SEO } from '../../components/SEO';

export const ForgotPasswordPage = () => {
    const { resetPassword } = useAuth();
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle'); // Removed 'loading' from status type
    const [message, setMessage] = useState('');

    // Initialize React Hook Form
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(ResetPasswordSchema)
    });

    // onSubmit function for React Hook Form
    const onSubmit = async (data: ResetPasswordFormData) => {
        setStatus('idle'); // Reset status before new submission
        setMessage(''); // Clear previous messages

        try {
            const result = await resetPassword(data.email);
            if (result.success) {
                setStatus('success');
                setMessage('Şifre sıfırlama bağlantısı email adresinize gönderildi.');
            } else {
                setStatus('error');
                setMessage(result.message || 'Bir hata oluştu');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Bir hata oluştu');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex flex-col">
            <SEO title="Şifremi Unuttum" description="Şifrenizi sıfırlamak için email adresinizi girin." />

            <nav className="w-full p-6">
                <Link to="/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                    <ArrowLeft size={20} />
                    <span className="font-bold">Giriş Yap</span>
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
                        <h1 className="text-2xl font-black text-gray-900">Şifremi Unuttum</h1>
                        <p className="text-gray-500 mt-2">Email adresinizi girin, size sıfırlama bağlantısı gönderelim.</p>
                    </div>

                    {status === 'success' ? (
                        <div className="bg-green-50 border border-green-100 rounded-lg p-6 text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Send size={24} className="text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-green-800 mb-2">Email Gönderildi!</h3>
                            <p className="text-green-700 text-sm mb-4">{message}</p>
                            <Link to="/login" className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition-colors">
                                Giriş Sayfasına Dön
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {status === 'error' && (
                                <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-3">
                                    <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700">{message}</p>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        {...register('email')} // Register input with React Hook Form
                                        type="email"
                                        className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 outline-none transition-all ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-amber-500 focus:ring-amber-200'}`}
                                        placeholder="ornek@email.com"
                                    />
                                </div>
                                {errors.email && <p className="text-xs text-red-500 font-medium pl-1">{errors.email.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting} // Use isSubmitting from React Hook Form
                                className="w-full py-4 bg-amber-600 text-white rounded-xl font-bold text-lg hover:bg-amber-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                            >
                                {isSubmitting ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
                            </button>
                        </form>
                    )}
                </motion.div>
            </main>
        </div>
    );
};
