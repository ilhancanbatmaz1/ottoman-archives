import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Home, BookOpen, Loader2, XCircle, AlertCircle } from 'lucide-react';
import { SEO } from '../components/SEO';

type VerificationStatus = 'loading' | 'success' | 'error' | 'invalid';

interface VerificationResult {
    success: boolean;
    error?: string;
    message?: string;
    subscriptionEndDate?: string;
}

export const PaymentSuccessPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<VerificationStatus>('loading');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    useEffect(() => {
        const verifyPayment = async () => {
            // Token'ı URL'den al
            const token = searchParams.get('token');

            if (!token) {
                setStatus('invalid');
                setErrorMessage('Ödeme token\'ı bulunamadı. Lütfen ödeme işlemini tekrar deneyin.');
                return;
            }

            try {
                // Backend'e doğrulama isteği gönder
                const response = await fetch(`/api/verify-payment?token=${encodeURIComponent(token)}`);
                const data: VerificationResult = await response.json();

                if (response.ok && data.success) {
                    setStatus('success');
                    setSuccessMessage(data.message || 'Premium üyeliğiniz başarıyla aktifleştirildi!');
                } else {
                    setStatus('error');
                    setErrorMessage(data.error || 'Ödeme doğrulaması başarısız oldu.');
                }
            } catch (err: any) {
                console.error('Payment verification error:', err);
                setStatus('error');
                setErrorMessage('Sunucu ile bağlantı kurulurken bir hata oluştu.');
            }
        };

        verifyPayment();
    }, [searchParams]);

    // Loading State
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
                <SEO title="Ödeme Doğrulanıyor" description="Ödemeniz doğrulanıyor, lütfen bekleyin" />
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Ödemeniz Doğrulanıyor
                        </h1>
                        <p className="text-sm text-gray-500">
                            Lütfen bekleyin, işleminiz tamamlanıyor...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Success State
    if (status === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
                <SEO title="Ödeme Başarılı" description="Premium üyeliğiniz başarıyla aktifleştirildi" />

                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        {/* Success Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            </div>
                        </div>

                        {/* Success Message */}
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
                            Ödeme Başarılı!
                        </h1>
                        <p className="text-lg text-gray-600 mb-2">
                            {successMessage}
                        </p>
                        <p className="text-sm text-gray-500 mb-8">
                            Artık tüm arşiv belgelerine sınırsız erişim sağlayabilirsiniz.
                        </p>

                        {/* Premium Features */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
                            <p className="text-sm font-semibold text-amber-900 mb-2">
                                🌟 Premium Avantajlarınız
                            </p>
                            <ul className="text-xs text-amber-800 text-left space-y-1">
                                <li>✓ Tüm arşiv belgelerine sınırsız erişim</li>
                                <li>✓ Yüksek çözünürlüklü görsel indirme</li>
                                <li>✓ Detaylı transkriptler</li>
                                <li>✓ Öncelikli destek</li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/')}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors font-semibold"
                            >
                                <BookOpen size={20} />
                                Belgeleri Keşfet
                            </button>
                            <button
                                onClick={() => navigate('/progress')}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                <Home size={20} />
                                Profilime Git
                            </button>
                        </div>

                        {/* Footer Note */}
                        <p className="mt-6 text-xs text-gray-400">
                            Aboneliğiniz 30 gün boyunca geçerlidir
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Error or Invalid State
    const isInvalid = status === 'invalid';
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center px-4">
            <SEO title="Ödeme Hatası" description="Ödeme işleminizde bir sorun oluştu" />

            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    {/* Error Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                            {isInvalid ? (
                                <AlertCircle className="w-12 h-12 text-red-600" />
                            ) : (
                                <XCircle className="w-12 h-12 text-red-600" />
                            )}
                        </div>
                    </div>

                    {/* Error Message */}
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
                        {isInvalid ? 'Geçersiz İstek' : 'Ödeme Başarısız'}
                    </h1>
                    <p className="text-base text-gray-600 mb-8">
                        {errorMessage || 'Bir hata oluştu. Lütfen tekrar deneyin.'}
                    </p>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/premium')}
                            className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors font-semibold"
                        >
                            Tekrar Dene
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            Ana Sayfaya Dön
                        </button>
                    </div>

                    {/* Support Note */}
                    <p className="mt-6 text-xs text-gray-400">
                        Sorun devam ederse lütfen destek ekibiyle iletişime geçin
                    </p>
                </div>
            </div>
        </div>
    );
};
