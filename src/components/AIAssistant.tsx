import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Bot, Info } from 'lucide-react';
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

// Pre-defined quick suggestions
const SUGGESTED_PROMPTS = [
    "Bu belgeyi özetle",
    "Günümüz Türkçesine çevir",
    "Zor kelimeleri açıkla",
    "Belgenin türü nedir?"
];

export const AIAssistant = ({ documentContext, documentTitle }: Props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    // UI Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userText = input.trim();

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: userText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Prepare history in the format expected by our service
            const history = messages.map(m => ({
                role: m.role,
                text: m.text
            }));

            const responseText = await AIService.chat(userText, documentContext, history);

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
                text: 'Üzgünüm, bir bağlantı hatası oluştu. Lütfen daha sonra tekrar deneyin.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickPrompt = (prompt: string) => {
        setInput(prompt);
        // Optional: you could auto-send here if desired
    };

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-600 hover:bg-amber-700'
                    } text-white`}
                title={isOpen ? "Asistanı Kapat" : "AI Asistan"}
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
                        <div className="bg-amber-600 p-4 text-white flex justify-between items-center shadow-sm">
                            <div className="flex items-center gap-2">
                                <Bot size={20} />
                                <div>
                                    <h3 className="font-bold">AI Asistan</h3>
                                    <p className="text-xs text-amber-100 opacity-80 line-clamp-1">{documentTitle}</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 opacity-60">
                                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                                        <Sparkles size={32} className="text-amber-500" />
                                    </div>
                                    <h4 className="font-bold text-gray-700">Size nasıl yardımcı olabilirim?</h4>
                                    <p className="text-sm text-gray-500">
                                        Belgeyi analiz ettim. Çeviri isteyebilir veya kelime anlamlarını sorabilirsiniz.
                                    </p>
                                </div>
                            )}

                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-amber-600 text-white rounded-tr-none shadow-sm'
                                                : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex gap-1.5 items-center">
                                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce delay-100" />
                                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce delay-200" />
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Footer Section */}
                        <div className="bg-white border-t border-gray-200">
                            {/* Quick Prompts */}
                            {messages.length < 3 && (
                                <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar mask-gradient border-b border-gray-50">
                                    {SUGGESTED_PROMPTS.map((prompt) => (
                                        <button
                                            key={prompt}
                                            onClick={() => handleQuickPrompt(prompt)}
                                            className="flex-shrink-0 text-xs bg-amber-50 border border-amber-100 text-amber-800 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors whitespace-nowrap font-medium"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Input Area */}
                            <div className="p-4">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="Bir soru sorun..."
                                        className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                                        disabled={loading}
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!input.trim() || loading}
                                        className="p-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                                <div className="mt-2 text-center">
                                    <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                                        <Info size={10} />
                                        AI cevapları her zaman %100 doğru olmayabilir.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
