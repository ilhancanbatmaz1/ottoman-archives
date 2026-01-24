import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Force check immediately
        const checkDevice = () => {
            const userAgent = window.navigator.userAgent.toLowerCase();
            const isIosDevice = /iphone|ipad|ipod/.test(userAgent) ||
                (navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform));

            // Check if running in standalone mode
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                (window.navigator as any).standalone === true;

            console.log('Device Check:', { isIosDevice, isStandalone, userAgent });

            if (isIosDevice && !isStandalone) {
                setIsIOS(true);
                // Force visibility for iOS
                setIsVisible(true);
            }
        };

        checkDevice();

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (isIOS) return;

        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-[9999] overflow-hidden"
                    style={{ position: 'fixed', bottom: '16px', zIndex: 9999 }} // Inline styles to force override
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-700" />
                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X size={16} />
                    </button>

                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                            {isIOS ? <Share size={24} /> : <Smartphone size={24} />}
                        </div>
                        <div className="flex-1 pt-1">
                            <h3 className="font-bold text-gray-900 leading-tight mb-1">
                                {isIOS ? 'iOS İçin Yükle' : 'Uygulamayı Yükle'}
                            </h3>
                            <p className="text-sm text-gray-500 mb-3 leading-relaxed">
                                {isIOS
                                    ? <span className="flex items-center gap-1 flex-wrap">
                                        Tarayıcı menüsünden <Share size={14} className="inline text-blue-600" /> <b>Paylaş</b> butonuna ve ardından <b>Ana Ekrana Ekle</b>'ye basın.
                                    </span>
                                    : "Daha hızlı erişim ve çevrimdışı kullanım için ana ekrana ekleyin."}
                            </p>
                            {!isIOS && (
                                <button
                                    onClick={handleInstallClick}
                                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-sm shadow-lg shadow-amber-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Download size={16} /> Ana Ekrana Ekle
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
