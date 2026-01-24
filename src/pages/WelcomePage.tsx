import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scroll, BookOpen, Star, Trophy, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SEO } from '../components/SEO';

export const WelcomePage = () => {
    return (
        <div className="min-h-screen bg-amber-50 text-gray-900 font-sans selection:bg-amber-100 selection:text-amber-900">
            <SEO title="Ana Sayfa" description="Osmanlı Türkçesi arşiv belgelerini okumayı öğrenmek için en kapsamlı platform. Orijinal belgelerle tarih yolculuğuna çıkın." />
            {/* Header */}
            <nav className="w-full px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="bg-amber-700 text-white p-2 rounded-xl shadow-lg shadow-amber-700/20">
                        <Scroll size={24} />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-gray-900">BELGE <span className="text-amber-700">OKUMA</span></span>
                </div>
                <div className="flex gap-4">
                    <Link to="/login" className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-white/50 hover:text-gray-900 transition-all">
                        Giriş Yap
                    </Link>
                    <Link to="/signup" className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform">
                        Kayıt Ol
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-12 pb-24 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex-1 text-center lg:text-left z-10"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-800 text-sm font-bold uppercase tracking-wider mb-8 border border-amber-200">
                            <Star size={16} fill="currentColor" /> %100 Ücretsiz Eğitim Aracı
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-tight mb-8">
                            Tarihin <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-amber-500">Tozlu Sayfalarını</span> Aralayın
                        </h1>
                        <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                            Osmanlıca arşiv belgelerini okumayı öğrenin, kendinizi geliştirin ve tarihe tanıklık edin. Yapay zeka destekli pratik araçlarıyla öğrenmek artık çok daha kolay.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link to="/signup" className="px-8 py-4 bg-amber-600 text-white rounded-2xl font-bold text-lg hover:bg-amber-700 transition-all shadow-xl shadow-amber-600/30 flex items-center justify-center gap-2 hover:-translate-y-1 transform">
                                Hemen Başlayın <ArrowRight size={20} />
                            </Link>
                            <Link to="/login" className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                                Giriş Yap
                            </Link>
                        </div>

                        <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-gray-500 text-sm font-bold uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-green-500" /> Binlerce Belge
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-green-500" /> İnteraktif Pratik
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-green-500" /> İlerleme Takibi
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex-1 relative"
                    >
                        <div className="relative z-10 bg-white p-4 rounded-3xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 border border-gray-100">
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/First_page_of_the_Treaty_of_Karlowitz.jpg/800px-First_page_of_the_Treaty_of_Karlowitz.jpg"
                                alt="Osmanlıca Belge Örneği"
                                className="rounded-2xl w-full h-auto object-cover shadow-inner"
                            />

                            {/* Floating Stats Cards */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -bottom-8 -left-8 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4"
                            >
                                <div className="bg-green-100 p-3 rounded-xl text-green-600">
                                    <Trophy size={24} />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 font-bold uppercase">Başarı</div>
                                    <div className="text-xl font-black text-gray-900">Liderlik Tablosu</div>
                                </div>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute -top-8 -right-8 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4"
                            >
                                <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                                    <BookOpen size={24} />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 font-bold uppercase">Kütüphane</div>
                                    <div className="text-xl font-black text-gray-900">1000+ Kelime</div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Decorative background blobs */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-amber-400/20 rounded-full blur-3xl -z-10" />
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl -z-10" />
                    </motion.div>
                </div>
            </header>

            {/* Features Grid */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-gray-900 mb-4">Neden Biz?</h2>
                        <p className="text-gray-500 max-w-xl mx-auto">Tarih öğrenmeyi sevenler için özel olarak tasarlanmış araçlarla deneyiminizi bir üst seviyeye taşıyın.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-3xl bg-amber-50 border border-amber-100 hover:shadow-lg transition-all cursor-default">
                            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
                                <Scroll size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Orijinal Belgeler</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Gerçek arşiv belgeleri üzerinde çalışın. Hem orijinal metni görün hem de transkripsiyonunu anında kontrol edin.
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl bg-amber-50 border border-amber-100 hover:shadow-lg transition-all cursor-default">
                            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
                                <Star size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">İlerleme Takibi</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Öğrendiğiniz kelimeleri favorilere ekleyin, notlar alın ve günlük hedeflerinize ulaşarak rozetler kazanın.
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl bg-amber-50 border border-amber-100 hover:shadow-lg transition-all cursor-default">
                            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
                                <Users size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Topluluk</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Diğer tarih meraklılarıyla yarışın, liderlik tablosunda üst sıralara çıkın ve başarılarınızı paylaşın.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-gray-800 p-2 rounded-lg">
                            <Scroll size={20} />
                        </div>
                        <span className="font-bold">Osmanlıca Okuma Yardımcısı</span>
                    </div>
                    <div className="text-gray-400 text-sm">
                        © 2026 Tüm hakları saklıdır. Tarihi sevdirmek için geliştirildi.
                    </div>
                </div>
            </footer>
        </div>
    );
};
