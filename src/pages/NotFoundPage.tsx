import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { SEO } from '../components/SEO';

export const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <SEO title="Sayfa Bulunamadı" description="Aradığınız sayfa mevcut değil." />
            <div className="text-center max-w-md">
                <div className="text-9xl font-black text-amber-900/5 mb-4">404</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Sayfa Bulunamadı</h1>
                <p className="text-gray-500 mb-8">
                    Aradığınız belge veya sayfa taşınmış veya silinmiş olabilir.
                </p>

                <div className="flex flex-col gap-3">
                    <Link to="/" className="w-full py-4 bg-amber-700 text-white rounded-xl font-bold hover:bg-amber-800 transition-colors flex items-center justify-center gap-2">
                        <Home size={18} /> Ana Sayfaya Dön
                    </Link>
                    <Link to="/contact" className="w-full py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                        <Search size={18} /> Belgelerde Ara
                    </Link>
                </div>
            </div>
        </div>
    );
};
