import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Lock, LogIn, AlertCircle } from 'lucide-react';
import { LoginSchema, type LoginFormData } from '../../lib/validation';
import { SEO } from '../../components/SEO';

export const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [submitError, setSubmitError] = useState('');

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
        resolver: zodResolver(LoginSchema)
    });

    const onSubmit = async (data: LoginFormData) => {
        setSubmitError('');
        try {
            const result = await login(data.username, data.password);
            if (result.success) {
                navigate('/progress');
            } else {
                setSubmitError(result.message || 'Giriş başarısız');
            }
        } catch (err) {
            setSubmitError('Bir hata oluştu');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex flex-col">
            <SEO title="Giriş Yap" description="Hesabınıza giriş yapın ve kaldığınız yerden devam edin." />
            <nav className="w-full p-6">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                    <ArrowLeft size={20} />
                    <span className="font-bold">Ana Sayfa</span>
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
                            <LogIn size={32} className="text-amber-600" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900">Tekrar Hoş Geldiniz</h1>
                        <p className="text-gray-500 mt-2">Kaldığınız yerden devam etmek için giriş yapın</p>
                    </div>

                    {submitError && (
                        <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-3 mb-6">
                            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{submitError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Email veya Kullanıcı Adı</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    {...register('username')}
                                    type="text"
                                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 outline-none transition-all ${errors.username ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-amber-500 focus:ring-amber-200'}`}
                                    placeholder="Kullanıcı adı veya email"
                                />
                            </div>
                            {errors.username && <p className="text-xs text-red-500 font-medium pl-1">{errors.username.message}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Şifre</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    {...register('password')}
                                    type="password"
                                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 outline-none transition-all ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-amber-500 focus:ring-amber-200'}`}
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && <p className="text-xs text-red-500 font-medium pl-1">{errors.password.message}</p>}
                        </div>

                        <div className="flex justify-end mt-2 mb-4">
                            <Link to="/forgot-password" className="text-sm font-bold text-amber-600 hover:text-amber-800 hover:underline transition-colors py-2 inline-block">
                                Şifreni mi unuttun?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-amber-600 text-white rounded-xl font-bold text-lg hover:bg-amber-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        Hesabınız yok mu?{' '}
                        <Link to="/signup" className="text-amber-600 font-bold hover:underline">
                            Hemen Kayıt Olun
                        </Link>
                    </div>


                </motion.div>
            </main>
        </div >
    );
};

