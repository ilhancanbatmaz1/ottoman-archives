import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Info, Check, AlertCircle } from 'lucide-react';
import { AIService } from '../services/AIService';

interface Props {
    documentContext: string;
    documentTitle: string;
}

interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
    isQuiz?: boolean;
    quizData?: QuizQuestion[];
    timestamp: Date;
}

export interface AIAssistantHandle {
    ask: (question: string) => void;
}

// Pre-defined quick suggestions
const SUGGESTED_PROMPTS = [
    "Bu belgeyi özetle",
    "Beni bu belgeyle ilgili test et (3 soru)",
    "Zor kelimeleri açıkla",
    "Belgenin türü nedir?"
];

// Quiz Card Component
const QuizCard = ({ question, index, onAnswer }: { question: QuizQuestion, index: number, onAnswer: (isCorrect: boolean) => void }) => {
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    const handleSelect = (optionIndex: number) => {
        if (isAnswered) return;
        setSelectedOption(optionIndex);
        setIsAnswered(true);
        onAnswer(optionIndex === question.correctAnswer);
    };

    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 mt-2 mb-4 w-full">
            <div className="bg-amber-50 p-3 border-b border-amber-100 flex justify-between items-center">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Soru {index + 1}</span>
                {isAnswered && (
                    selectedOption === question.correctAnswer
                        ? <span className="text-xs font-bold text-green-600 flex items-center gap-1"><Check size={12} /> Doğru</span>
                        : <span className="text-xs font-bold text-red-600 flex items-center gap-1"><AlertCircle size={12} /> Yanlış</span>
                )}
            </div>
            <div className="p-4">
                <p className="text-sm font-medium text-gray-800 mb-3">{question.question}</p>
                <div className="space-y-2">
                    {question.options.map((option, optIndex) => {
                        let btnClass = "w-full text-left p-3 text-xs rounded-lg border transition-all relative ";

                        if (isAnswered) {
                            if (optIndex === question.correctAnswer) {
                                btnClass += "bg-green-100 border-green-300 text-green-800 font-bold";
                            } else if (optIndex === selectedOption && selectedOption !== question.correctAnswer) {
                                btnClass += "bg-red-50 border-red-200 text-red-800";
                            } else {
                                btnClass += "bg-gray-50 border-gray-100 text-gray-400 opacity-60";
                            }
                        } else {
                            btnClass += "bg-white border-gray-200 hover:bg-amber-50 hover:border-amber-200 text-gray-700";
                        }

                        return (
                            <button
                                key={optIndex}
                                onClick={() => handleSelect(optIndex)}
                                disabled={isAnswered}
                                className={btnClass}
                            >
                                <span className="font-bold mr-2">{String.fromCharCode(65 + optIndex)}.</span> {option}
                            </button>
                        );
                    })}
                </div>
                {isAnswered && (
                    <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 italic">
                        <span className="font-bold">Açıklama:</span> {question.explanation}
                    </div>
                )}
            </div>
        </div>
    );
};

export const AIAssistant = forwardRef<AIAssistantHandle, Props>(({ documentContext, documentTitle }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    // UI Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
        ask: (question: string) => {
            setIsOpen(true);
            handleSend(question);
        }
    }));

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const handleSend = async (textOverride?: string) => {
        const textToUse = textOverride || input;

        if (!textToUse.trim() || loading) return;

        const userText = textToUse.trim();
        const isQuizRequest = userText.toLowerCase().includes("test et") || userText.toLowerCase().includes("sınav");

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: userText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        if (!textOverride) setInput('');
        setLoading(true);

        try {
            // Determine mode
            const mode = isQuizRequest ? 'quiz' : 'chat';

            const history = messages.filter(m => !m.isQuiz).map(m => ({
                role: m.role,
                text: m.text
            }));

            const responseText = await AIService.chat(userText, documentContext, history, mode);

            let aiMessage: Message;

            if (mode === 'quiz') {
                try {
                    // Start parsing from first [ and end at last ]
                    const jsonStart = responseText.indexOf('[');
                    const jsonEnd = responseText.lastIndexOf(']');

                    if (jsonStart !== -1 && jsonEnd !== -1) {
                        const jsonStr = responseText.substring(jsonStart, jsonEnd + 1);
                        const quizData = JSON.parse(jsonStr) as QuizQuestion[];

                        aiMessage = {
                            id: (Date.now() + 1).toString(),
                            role: 'model',
                            text: 'İşte belgenizle ilgili hazırladığım sorular. Başarılar! 🎩',
                            isQuiz: true,
                            quizData: quizData,
                            timestamp: new Date()
                        };
                    } else {
                        throw new Error("Invalid JSON format");
                    }
                } catch (e) {
                    console.error("Quiz parse error", e);
                    aiMessage = {
                        id: (Date.now() + 1).toString(),
                        role: 'model',
                        text: 'Sınav oluşturulurken bir hata oluştu, ancak metin olarak cevap verebilirim: \n' + responseText,
                        timestamp: new Date()
                    };
                }
            } else {
                aiMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'model',
                    text: responseText,
                    timestamp: new Date()
                };
            }

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
        handleSend(prompt);
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
                title={isOpen ? "Asistanı Kapat" : "Mr. Osmanlıca"}
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
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <img
                                        src="/mr_osmanlica.png"
                                        alt="Mr. Osmanlıca"
                                        className="w-10 h-10 rounded-full border-2 border-white/20 shadow-sm object-cover bg-amber-100"
                                    />
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-amber-600 rounded-full"></div>
                                </div>
                                <div>
                                    <h3 className="font-bold">Mr. Osmanlıca 🎩</h3>
                                    <p className="text-xs text-amber-100 opacity-80 line-clamp-1">{documentTitle}</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 opacity-60">
                                    <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-2 shadow-inner border-4 border-white">
                                        <img
                                            src="/mr_osmanlica.png"
                                            alt="Mr. Osmanlıca"
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    </div>
                                    <h4 className="font-bold text-gray-700 text-lg">Merhaba! Ben Mr. Osmanlıca</h4>
                                    <p className="text-sm text-gray-500">
                                        Belgeyi analiz ettim. Çeviri isteyebilir veya kelime anlamlarını sorabilirsiniz.
                                    </p>
                                </div>
                            )}

                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'model' && (
                                        <img
                                            src="/mr_osmanlica.png"
                                            alt="Mr. Osmanlıca"
                                            className="w-8 h-8 rounded-full border border-gray-200 bg-amber-50 object-cover mb-1 shadow-sm shrink-0"
                                        />
                                    )}

                                    <div
                                        className={`max-w-[85%] ${msg.isQuiz ? 'w-full' : ''} ${msg.role === 'user'
                                                ? 'bg-amber-600 text-white p-3 rounded-2xl rounded-br-none shadow-md'
                                                : 'bg-white text-gray-800 shadow-md border border-gray-100 rounded-2xl rounded-bl-none p-3'
                                            }`}
                                    >
                                        {msg.text}
                                        {msg.isQuiz && msg.quizData && (
                                            <div className="mt-2">
                                                {msg.quizData.map((q, idx) => (
                                                    <QuizCard key={idx} question={q} index={idx} onAnswer={() => { }} />
                                                ))}
                                            </div>
                                        )}
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
                                        onClick={() => handleSend()}
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
});

AIAssistant.displayName = 'AIAssistant';
