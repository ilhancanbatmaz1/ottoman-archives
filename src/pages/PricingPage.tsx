import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

import { SEO } from '../components/SEO';

export const PricingPage = () => {
    const { user } = useAuth(); // We might need to refresh user session
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        if (!user || !user.id || user.id === 'undefined' || String(user.id).trim() === '') {
            console.error('Invalid user ID detected:', user?.id);
            showToast('error', 'Oturum bilgisinde hata var. Lütfen çıkış yapıp tekrar girin.');
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            const paymentPayload = {
                userId: user.id,
                email: user.email,
                userDetails: {
                    name: user.fullName || user.username,
                }
            };

            const response = await fetch('/api/start-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentPayload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Payment API error:', errorData);
                throw new Error(errorData.error?.errorMessage || errorData.error || 'Ödeme başlatılamadı.');
            }

            const data = await response.json();
            const { paymentPageUrl } = data;

            if (paymentPageUrl) {
                window.location.href = paymentPageUrl;
            } else {
                throw new Error('Ödeme sayfası URL\'i alınamadı.');
            }

        } catch (err: any) {
            console.error('Payment error:', err);
            showToast('error', err.message || 'Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <SEO title="Premium Üyelik" description="Osmanlıca Arşiv Premium üyeliği ile tüm belgelere sınırsız erişim sağlayın." />

            <div className="max-w-7xl mx-auto">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Premium Üyelik Avantajları
                    </h2>
                    <p className="mt-4 text-xl text-gray-500">
                        Tarihi derinlemesine keşfetmek için sınırları kaldırın.
                    </p>
                </div>

                <div className="mt-16 bg-white rounded-2xl shadow-xl overflow-hidden lg:flex lg:max-w-4xl lg:mx-auto border border-gray-100">
                    <div className="p-8 lg:flex-1 lg:p-12">
                        <h3 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                            <Star className="text-amber-500 fill-amber-500" />
                            Premium Üye
                        </h3>
                        <p className="mt-6 text-base text-gray-500">
                            Araştırmacılar, öğrenciler ve tarih meraklıları için hazırlanmış eksiksiz paket.
                        </p>
                        <ul className="mt-8 space-y-4">
                            <li className="flex items-start">
                                <div className="flex-shrink-0">
                                    <Check className="h-6 w-6 text-green-500" />
                                </div>
                                <p className="ml-3 text-base text-gray-700">Tüm arşiv belgelerine sınırsız erişim</p>
                            </li>
                            <li className="flex items-start">
                                <div className="flex-shrink-0">
                                    <Check className="h-6 w-6 text-green-500" />
                                </div>
                                <p className="ml-3 text-base text-gray-700">Yüksek çözünürlüklü görsel indirme</p>
                            </li>
                            <li className="flex items-start">
                                <div className="flex-shrink-0">
                                    <Check className="h-6 w-6 text-green-500" />
                                </div>
                                <p className="ml-3 text-base text-gray-700">Uzmanlar tarafından hazırlanmış detaylı transkriptler</p>
                            </li>
                            <li className="flex items-start">
                                <div className="flex-shrink-0">
                                    <Check className="h-6 w-6 text-green-500" />
                                </div>
                                <p className="ml-3 text-base text-gray-700">Öncelikli destek ve yeni içeriklere erken erişim</p>
                            </li>
                        </ul>
                    </div>
                    <div className="p-8 bg-gray-50 lg:p-12 lg:flex-shrink-0 flex flex-col justify-center items-center border-l border-gray-100">
                        <p className="text-lg leading-6 font-medium text-gray-900">
                            Aylık Abonelik
                        </p>
                        <div className="mt-4 flex items-baseline text-5xl font-extrabold text-gray-900">
                            50₺
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                            / ay
                        </p>
                        <div className="mt-6 w-full">
                            <button
                                onClick={handleSubscribe}
                                disabled={loading || user?.subscriptionStatus === 'premium'}
                                className={`w-full flex items-center justify-center px-6 py-4 border border-transparent text-base font-bold rounded-xl text-white md:py-4 md:text-lg transition-all ${user?.subscriptionStatus === 'premium' ? 'bg-green-600 cursor-default' : 'bg-gray-900 hover:bg-black shadow-lg hover:shadow-xl'}`}
                            >
                                {loading ? 'İşleniyor...' : user?.subscriptionStatus === 'premium' ? 'Zaten Üyesiniz' : 'Hemen Abone Ol'}
                            </button>
                        </div>
                        <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
                            <Shield size={12} /> Güvenli Ödeme (Iyzico Altyapısı)
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
