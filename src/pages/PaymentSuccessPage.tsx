import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Home, BookOpen } from 'lucide-react';
import { SEO } from '../components/SEO';

export const PaymentSuccessPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const status = searchParams.get('status');

    useEffect(() => {
        // Redirect to home if accessed without proper status
        if (status !== 'success') {
            navigate('/premium');
        }
    }, [status, navigate]);

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
                        Premium üyeliğiniz aktif edildi
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
};
