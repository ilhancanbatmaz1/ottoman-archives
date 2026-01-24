import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { useState } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    url: string;
}

export const ShareModal = ({ isOpen, onClose, title, url }: Props) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Osmanlıca Okuma Arşivi',
                    text: title,
                    url: url
                });
                onClose();
            } catch (err) {
                console.log('Error sharing:', err);
            }
        }
    };

    const shareLinks = [
        {
            name: 'WhatsApp',
            icon: (
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            ),
            color: 'bg-[#25D366] hover:bg-[#20ba5a]',
            href: `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`
        },
        {
            name: 'X (Twitter)',
            icon: (
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            ),
            color: 'bg-black hover:bg-gray-800',
            href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
                    >
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Share2 size={18} /> Paylaş
                            </h3>
                            <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Copy Link Section */}
                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                <span className="text-xs text-gray-500 truncate flex-1 font-mono">{url}</span>
                                <button
                                    onClick={handleCopy}
                                    className={`p-2 rounded-md transition-all ${copied
                                        ? 'bg-green-500 text-white'
                                        : 'bg-white text-gray-600 hover:text-amber-600 shadow-sm border border-gray-200'}`}
                                >
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                </button>
                            </div>

                            {/* Social Buttons */}
                            <div className="grid grid-cols-2 gap-3">
                                {shareLinks.map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold text-sm transition-transform active:scale-95 ${link.color}`}
                                    >
                                        {link.icon}
                                        {link.name}
                                    </a>
                                ))}
                            </div>

                            {/* Native Share for Mobile */}
                            {typeof navigator.share === 'function' && (
                                <button
                                    onClick={handleShare}
                                    className="w-full py-3 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Share2 size={16} /> Diğer Seçenekler
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
