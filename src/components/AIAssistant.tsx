import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Key, Settings, Trash2, Bot } from 'lucide-react';
import { AIService } from '../services/AIService';

interface Props {
    documentContext: string;
    documentTitle: string;
}

interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: Date;
}

export const AIAssistant = ({ documentContext, documentTitle }: Props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [isConfigured, setIsConfigured] = useState(false);
    const [showConfig, setShowConfig] = useState(false);

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial load check
    useEffect(() => {
        const storedKey = AIService.getStoredApiKey();
        if (storedKey) {
            setIsConfigured(true);
            setApiKey(storedKey); // Pre-fill for UI
        }
    }, []);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const handleSaveKey = () => {
        if (!apiKey.trim()) return;
        AIService.initialize(apiKey);
        setIsConfigured(true);
        setShowConfig(false);
    };

    const handleClearKey = () => {
        AIService.clearApiKey();
        setIsConfigured(false);
        setApiKey('');
        setMessages([]);
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Prepare history for API
            const history = messages.map(m => ({
                role: m.role,
                parts: m.text
            }));

            const responseText = await AIService.chat(userMessage.text, documentContext, history);

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: responseText,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: 'Üzgünüm, bir hata oluştu. Lütfen API anahtarınızı kontrol edin veya daha sonra tekrar deneyin.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickPrompt = (prompt: string) => {
        setInput(prompt);
        // Optional: auto send
        // handleSend();
    };

    const suggestedPrompts = [
        "Bu belgeyi özetle",
        "Günümüz Türkçesine çevir",
        "Zor kelimeleri açıkla",
        "Belgenin türü nedir?"
    ];

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-600 hover:bg-amber-700'
                    } text-white`}
            >
                {isOpen ? <X size={24} /> : <Sparkles size={24} />}
            </motion.button>

            {/* Chat Interface */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 z-40 w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[600px] h-[80vh]"
                    >
                        {/* Header */}
                        <div className="bg-amber-600 p-4 text-white flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Bot size={20} />
                                <div>
                                    <h3 className="font-bold">AI Asistan</h3>
                                    <p className="text-xs text-amber-100 opacity-80 line-clamp-1">{documentTitle}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowConfig(!showConfig)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                title="Ayarlar"
                            >
                                <Settings size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-hidden flex flex-col relative bg-gray-50">
                            {(!isConfigured || showConfig) ? (
                                <div className="p-6 flex flex-col h-full overflow-y-auto">
                                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                                            <Key size={32} />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Kurulum Gerekli</h3>
                                        <p className="text-sm text-gray-600">
                                            AI Asistanı kullanmak için Google Gemini API anahtarına ihtiyacınız var.
                                            Bu anahtar sadece tarayıcınızda (localStorage) saklanır.
                                        </p>

                                        <div className="w-full space-y-4 mt-4">
                                            <div>
                                                <label className="block text-left text-xs font-bold text-gray-500 uppercase mb-1">API Key</label>
                                                <input
                                                    type="password"
                                                    value={apiKey}
                                                    onChange={(e) => setApiKey(e.target.value)}
                                                    placeholder="AIzaSy..."
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                                                />
                                            </div>

                                            <button
                                                onClick={handleSaveKey}
                                                disabled={!apiKey.trim()}
                                                className="w-full py-3 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Kaydet ve Başla
                                            </button>

                                            <p className="text-xs text-gray-400">
                                                Anahtarınızı <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-amber-600 underline">Google AI Studio</a>'dan ücretsiz alabilirsiniz.
                                            </p>
                                        </div>

                                        {isConfigured && (
                                            <button
                                                onClick={handleClearKey}
                                                className="mt-4 flex items-center gap-2 text-red-500 text-sm hover:underline"
                                            >
                                                <Trash2 size={14} /> Mevcut anahtarı sil
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Messages Area */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {messages.length === 0 && (
                                            <div className="text-center py-8 space-y-4 opacity-60">
                                                <Sparkles size={48} className="mx-auto text-amber-400" />
                                                <p className="text-sm text-gray-500">
                                                    Bu belge hakkında bana soru sorabilir, çeviri isteyebilir veya analiz yaptırabilirsiniz.
                                                </p>
                                            </div>
                                        )}

                                        {messages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                                        ? 'bg-amber-600 text-white rounded-tr-none'
                                                        : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
                                                        }`}
                                                >
                                                    {msg.text}
                                                </div>
                                            </div>
                                        ))}

                                        {loading && (
                                            <div className="flex justify-start">
                                                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex gap-1">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                                                </div>
                                            </div>
                                        )}

                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Quick Prompts */}
                                    {messages.length < 2 && (
                                        <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar mask-gradient">
                                            {suggestedPrompts.map((prompt) => (
                                                <button
                                                    key={prompt}
                                                    onClick={() => handleQuickPrompt(prompt)}
                                                    className="flex-shrink-0 text-xs bg-white border border-amber-200 text-amber-700 px-3 py-1.5 rounded-full hover:bg-amber-50 transition-colors whitespace-nowrap"
                                                >
                                                    {prompt}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Input Area */}
                                    <div className="p-4 bg-white border-t border-gray-100">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                                placeholder="Bir soru sorun..."
                                                className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                disabled={loading}
                                            />
                                            <button
                                                onClick={handleSend}
                                                disabled={!input.trim() || loading}
                                                className="p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Send size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
