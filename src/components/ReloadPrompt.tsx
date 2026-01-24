import { useRegisterSW } from 'virtual:pwa-register/react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ReloadPrompt = () => {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    return (
        <AnimatePresence>
            {(offlineReady || needRefresh) && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-6 right-6 z-[9999] max-w-sm w-full"
                >
                    <div className="bg-gray-900 text-white p-4 rounded-xl shadow-2xl border border-gray-700 flex items-start gap-4">
                        <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500 mt-1">
                            {needRefresh ? <RefreshCw size={20} className="animate-spin-slow" /> : <AlertTriangle size={20} />}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1">
                                {needRefresh ? 'Güncelleme Mevcut' : 'Çevrimdışı Hazır'}
                            </h3>
                            <p className="text-gray-400 text-sm mb-4">
                                {needRefresh
                                    ? 'Yeni içerikler ve iyileştirmeler mevcut. Yüklemek için yenileyin.'
                                    : 'Uygulama artık internetsiz çalışabilir.'}
                            </p>
                            <div className="flex gap-2">
                                {needRefresh && (
                                    <button
                                        onClick={() => updateServiceWorker(true)}
                                        className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold hover:bg-amber-700 transition-colors"
                                    >
                                        Yenile
                                    </button>
                                )}
                                <button
                                    onClick={close}
                                    className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm font-bold hover:bg-gray-700 transition-colors"
                                >
                                    Kapat
                                </button>
                            </div>
                        </div>
                        <button onClick={close} className="text-gray-500 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
