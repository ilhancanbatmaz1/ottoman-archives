import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ArchivalDocument, WordToken } from '../data/documents';
import { BookOpen, MousePointerClick, X, Info, PenTool, Check, RotateCcw, Eye, EyeOff, ZoomIn, ZoomOut, RotateCw, Star, StickyNote, Download, AlertTriangle, Send } from 'lucide-react';
import { useLearning } from '../context/LearningContext';
import { useFeedback } from '../context/FeedbackContext';
import { SEO } from './SEO';

interface Props {
    doc: ArchivalDocument;
}

export const DocumentViewer = ({ doc }: Props) => {
    const [view, setView] = useState<'interactive' | 'fulltext' | 'practice'>('interactive');
    const [selectedWord, setSelectedWord] = useState<WordToken | null>(null);
    const [hoveredWord, setHoveredWord] = useState<WordToken | null>(null);

    // Learning context
    const { recordAttempt, toggleFavorite, isFavorite, addNote, getNote } = useLearning();
    const [noteInput, setNoteInput] = useState('');
    const [showNoteInput, setShowNoteInput] = useState(false);

    // Practice mode states
    const [userGuess, setUserGuess] = useState('');
    const [guessResult, setGuessResult] = useState<'correct' | 'incorrect' | null>(null);
    const [attemptedWords, setAttemptedWords] = useState<Map<string, boolean>>(new Map());
    const [showFullLine, setShowFullLine] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);

    // Download and Error Report states
    const { addErrorReport } = useFeedback();
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorSuggestion, setErrorSuggestion] = useState('');
    const [errorNote, setErrorNote] = useState('');
    const [errorSubmitted, setErrorSubmitted] = useState(false);

    // Reset state when doc changes
    useEffect(() => {
        setSelectedWord(null);
        setView('interactive');
        setUserGuess('');
        setGuessResult(null);
        setAttemptedWords(new Map());
    }, [doc.id]);

    // Reset guess when selecting a new word
    useEffect(() => {
        setUserGuess('');
        setGuessResult(null);
    }, [selectedWord?.id]);

    const handleCheckGuess = () => {
        if (!selectedWord || !userGuess.trim()) return;

        const isCorrect = userGuess.trim().toLowerCase() === selectedWord.modern.toLowerCase();
        setGuessResult(isCorrect ? 'correct' : 'incorrect');
        setAttemptedWords(prev => new Map(prev).set(selectedWord.id, isCorrect));

        // Record attempt in learning context
        recordAttempt(doc.id, selectedWord.id, selectedWord.original, selectedWord.modern, isCorrect);
    };

    const handleAddNote = () => {
        if (!selectedWord || !noteInput.trim()) return;
        addNote(doc.id, selectedWord.id, selectedWord.original, selectedWord.modern, noteInput.trim());
        setNoteInput('');
        setShowNoteInput(false);
    };

    const getWordKey = (wordId: string) => `${doc.id}-${wordId}`;

    const handleResetPractice = () => {
        setAttemptedWords(new Map());
        setSelectedWord(null);
        setUserGuess('');
        setGuessResult(null);
    };

    const getWordBorderColor = (tokenId: string) => {
        if (view !== 'practice') {
            return selectedWord?.id === tokenId ? 'border-amber-600 bg-amber-600/30' : 'border-transparent hover:bg-white/20';
        }

        if (attemptedWords.has(tokenId)) {
            return attemptedWords.get(tokenId)
                ? 'border-green-500 bg-green-500/30'
                : 'border-red-500 bg-red-500/30';
        }

        return selectedWord?.id === tokenId ? 'border-amber-600 bg-amber-600/30' : 'border-transparent hover:bg-white/20';
    };

    const correctCount = Array.from(attemptedWords.values()).filter(v => v).length;
    const totalAttempts = attemptedWords.size;

    return (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <SEO title={doc.title} description={`${doc.title} adlı Osmanlıca belgeyi inceleyin ve pratik yapın.`} />

            {/* Görünüm Seçenekleri */}
            <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => setView('interactive')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${view === 'interactive' ? 'bg-amber-700 text-white' : 'text-gray-500 hover:bg-gray-200'}`}
                    >
                        <MousePointerClick size={14} /> Okuma Modu
                    </button>
                    <button
                        onClick={() => setView('practice')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${view === 'practice' ? 'bg-green-600 text-white' : 'text-gray-500 hover:bg-gray-200'}`}
                    >
                        <PenTool size={14} /> Pratik Modu
                    </button>
                    <button
                        onClick={() => setView('fulltext')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${view === 'fulltext' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-200'}`}
                    >
                        <BookOpen size={14} /> Tam Metin
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            const link = document.createElement('a');
                            link.href = doc.imageUrl;
                            link.download = `${doc.title}.jpg`;
                            link.click();
                        }}
                        className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-gray-500 hover:bg-gray-200 transition-all"
                        title="Belgeyi İndir"
                    >
                        <Download size={14} /> İndir
                    </button>
                    <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest hidden sm:block">
                        Belge Türü: {doc.category}
                    </div>
                </div>
            </div>

            <div className="p-8">
                <AnimatePresence mode="wait">
                    {view === 'interactive' && (
                        <motion.div
                            key="interactive"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
                        >
                            {/* Belge Görseli */}
                            <div className="flex flex-col gap-4">
                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3">
                                    <Info className="text-amber-700 shrink-0 mt-0.5" size={18} />
                                    <div>
                                        <h4 className="text-sm font-bold text-amber-900">Nasıl Kullanılır?</h4>
                                        <p className="text-sm text-amber-800/80 mt-1">
                                            Belge üzerinde okuyamadığınız veya emin olamadığınız kelimenin üzerine tıklayın. Sistem size o kelimenin latinize halini gösterecektir.
                                        </p>
                                    </div>
                                </div>

                                {/* Zoom Kontrolleri */}
                                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Yakınlaştırma</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
                                            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                                            disabled={zoomLevel <= 0.5}
                                        >
                                            <ZoomOut size={16} className="text-gray-600" />
                                        </button>
                                        <span className="text-sm font-bold text-gray-700 min-w-[50px] text-center">
                                            {Math.round(zoomLevel * 100)}%
                                        </span>
                                        <button
                                            onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.25))}
                                            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                                            disabled={zoomLevel >= 3}
                                        >
                                            <ZoomIn size={16} className="text-gray-600" />
                                        </button>
                                        <button
                                            onClick={() => setZoomLevel(1)}
                                            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors ml-1"
                                            title="Sıfırla"
                                        >
                                            <RotateCw size={16} className="text-gray-600" />
                                        </button>
                                    </div>
                                </div>

                                <div className="relative rounded-xl overflow-visible shadow-lg border border-gray-200 bg-gray-50 group max-h-[600px]">
                                    <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left', transition: 'transform 0.2s ease' }}>
                                        <img src={doc.imageUrl} alt={doc.title} className="w-full h-auto block" />
                                        {doc.tokens.map((token) => token.coords && (
                                            <div
                                                key={token.id}
                                                onClick={() => setSelectedWord(token)}
                                                onMouseEnter={() => setHoveredWord(token)}
                                                onMouseLeave={() => setHoveredWord(null)}
                                                className={`absolute cursor-pointer transition-all border-2 ${selectedWord?.id === token.id ? 'border-amber-600 bg-amber-600/30' : 'border-transparent hover:bg-white/10'}`}
                                                style={{
                                                    left: `${token.coords.x}%`,
                                                    top: `${token.coords.y}%`,
                                                    width: `${token.coords.width}%`,
                                                    height: `${token.coords.height}%`
                                                }}
                                            />
                                        ))}

                                        {/* Hover Tooltip (Inside scale container to follow zoom) */}
                                        <AnimatePresence>
                                            {hoveredWord && !selectedWord && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 5, scale: 0.9 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute z-50 pointer-events-none flex flex-col items-center"
                                                    style={{
                                                        left: `${hoveredWord.coords!.x + hoveredWord.coords!.width / 2}%`,
                                                        top: `${hoveredWord.coords!.y}%`,
                                                        transform: 'translate(-50%, -100%)',
                                                        marginTop: '-8px' // Spacing
                                                    }}
                                                >
                                                    <div className="bg-gray-900/95 backdrop-blur text-white text-xs rounded-xl py-2 px-4 shadow-xl border border-white/10 whitespace-nowrap flex flex-col items-center">
                                                        <span className="font-medium text-amber-500 script-font text-lg leading-none mb-1">{hoveredWord.original}</span>
                                                        <span className="font-bold">{hoveredWord.modern}</span>
                                                    </div>
                                                    <div className="w-2 h-2 bg-gray-900/95 transform rotate-45 -mt-1 border-r border-b border-white/10"></div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

                            {/* Kelime Listesi ve Analiz */}
                            <div className="flex flex-col gap-8">
                                {selectedWord ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-8 bg-gray-900 text-white rounded-2xl shadow-xl relative"
                                    >
                                        <button onClick={() => setSelectedWord(null)} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
                                            <X size={20} />
                                        </button>
                                        <div className="space-y-6">
                                            <div>
                                                <div className="text-[10px] font-black uppercase text-amber-500 mb-2 tracking-widest">Seçilen İfade</div>
                                                <div className="text-6xl script-font mb-4 text-right pr-4">{selectedWord.original}</div>
                                            </div>
                                            <div className="h-[1px] bg-white/10" />
                                            <div>
                                                <div className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Güncel Türkçe Karşılığı</div>
                                                <div className="text-3xl font-bold text-white">{selectedWord.modern}</div>
                                                {selectedWord.note && <div className="text-base text-gray-400 mt-3 italic bg-white/5 p-3 rounded-lg border border-white/10">"{selectedWord.note}"</div>}
                                            </div>
                                            <div className="pt-4 border-t border-white/10">
                                                <button
                                                    onClick={() => setShowErrorModal(true)}
                                                    className="w-full py-2 px-4 bg-orange-500/20 text-orange-400 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-orange-500/30 transition-colors"
                                                >
                                                    <AlertTriangle size={16} /> Hata Bildir
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>

                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-100 rounded-2xl text-center text-gray-400">
                                        <MousePointerClick size={48} className="mb-4 text-gray-200" />
                                        <p className="text-lg font-medium">Bir kelime seçin</p>
                                        <p className="text-sm mt-2">Detaylı inceleme için görsel üzerindeki kelimelere tıklayın.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                    {view === 'practice' && (
                        <motion.div
                            key="practice"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
                        >
                            {/* Belge Görseli */}
                            <div className="flex flex-col gap-4">
                                <div className="p-4 bg-green-50 border border-green-100 rounded-lg flex items-start gap-3">
                                    <PenTool className="text-green-700 shrink-0 mt-0.5" size={18} />
                                    <div>
                                        <h4 className="text-sm font-bold text-green-900">Pratik Modu</h4>
                                        <p className="text-sm text-green-800/80 mt-1">
                                            Bir kelimeye tıklayın ve latinize karşılığını herhangi bir şapka, uzatma işareti vs. kullanmadan yazmayı deneyin. Doğru cevaplar yeşil, yanlış cevaplar kırmızı olarak işaretlenecektir.
                                        </p>
                                    </div>
                                </div>

                                {/* Skor Tablosu */}
                                {totalAttempts > 0 && (
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="text-sm">
                                                <span className="font-bold text-green-600">{correctCount}</span>
                                                <span className="text-gray-400"> / </span>
                                                <span className="font-bold text-gray-600">{totalAttempts}</span>
                                                <span className="text-gray-400 ml-1">doğru</span>
                                            </div>
                                            <div className="h-4 w-px bg-gray-200" />
                                            <div className="text-sm text-gray-500">
                                                %{Math.round((correctCount / totalAttempts) * 100)} başarı
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleResetPractice}
                                            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                                        >
                                            <RotateCcw size={12} /> Sıfırla
                                        </button>
                                    </div>
                                )}

                                {/* Zoom Kontrolleri */}
                                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Yakınlaştırma</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
                                            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                                            disabled={zoomLevel <= 0.5}
                                        >
                                            <ZoomOut size={16} className="text-gray-600" />
                                        </button>
                                        <span className="text-sm font-bold text-gray-700 min-w-[50px] text-center">
                                            {Math.round(zoomLevel * 100)}%
                                        </span>
                                        <button
                                            onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.25))}
                                            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                                            disabled={zoomLevel >= 3}
                                        >
                                            <ZoomIn size={16} className="text-gray-600" />
                                        </button>
                                        <button
                                            onClick={() => setZoomLevel(1)}
                                            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors ml-1"
                                            title="Sıfırla"
                                        >
                                            <RotateCw size={16} className="text-gray-600" />
                                        </button>
                                    </div>
                                </div>

                                <div className="relative rounded-xl overflow-auto shadow-lg border border-gray-200 bg-gray-50 group max-h-[600px]">
                                    <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left', transition: 'transform 0.2s ease' }}>
                                        <img src={doc.imageUrl} alt={doc.title} className="w-full h-auto block" />
                                        {doc.tokens.map((token) => token.coords && (
                                            <div
                                                key={token.id}
                                                onClick={() => setSelectedWord(token)}
                                                className={`absolute cursor-pointer transition-all border-2 ${getWordBorderColor(token.id)}`}
                                                style={{
                                                    left: `${token.coords.x}%`,
                                                    top: `${token.coords.y}%`,
                                                    width: `${token.coords.width}%`,
                                                    height: `${token.coords.height}%`
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Tahmin Kutusu */}
                            <div className="flex flex-col gap-8">
                                {selectedWord ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-8 rounded-2xl shadow-xl relative transition-colors ${guessResult === 'correct' ? 'bg-green-600' :
                                            guessResult === 'incorrect' ? 'bg-red-600' :
                                                'bg-gray-900'
                                            } text-white`}
                                    >
                                        <button onClick={() => setSelectedWord(null)} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
                                            <X size={20} />
                                        </button>
                                        <div className="space-y-6">
                                            <div>
                                                <div className="text-[10px] font-black uppercase text-amber-300 mb-2 tracking-widest">Seçilen İfade</div>
                                                <div className="text-6xl script-font mb-4 text-right pr-4">{selectedWord.original}</div>
                                            </div>
                                            <div className="h-[1px] bg-white/10" />

                                            {guessResult === null ? (
                                                <div className="space-y-4">
                                                    <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Tahmininizi Yazın</div>
                                                    <input
                                                        type="text"
                                                        value={userGuess}
                                                        onChange={(e) => setUserGuess(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleCheckGuess()}
                                                        placeholder="Latinize karşılığı..."
                                                        className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-xl font-bold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={handleCheckGuess}
                                                        className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                                                    >
                                                        <Check size={18} /> Kontrol Et
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        {guessResult === 'correct' ? (
                                                            <>
                                                                <Check size={32} className="text-white" />
                                                                <span className="text-2xl font-bold">Doğru!</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <X size={32} className="text-white" />
                                                                <span className="text-2xl font-bold">Yanlış!</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-black uppercase text-white/60 mb-1 tracking-widest">Doğru Cevap</div>
                                                        <div className="text-3xl font-bold text-white">{selectedWord.modern}</div>
                                                    </div>
                                                    {guessResult === 'incorrect' && (
                                                        <div className="text-sm text-white/70">
                                                            Sizin cevabınız: <span className="font-bold">{userGuess}</span>
                                                        </div>
                                                    )}

                                                    {/* Favori ve Not Butonları */}
                                                    <div className="pt-2 border-t border-white/20 flex gap-2">
                                                        <button
                                                            onClick={() => toggleFavorite(getWordKey(selectedWord.id))}
                                                            className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${isFavorite(getWordKey(selectedWord.id))
                                                                ? 'bg-amber-500 text-white'
                                                                : 'bg-white/20 text-white hover:bg-white/30'
                                                                }`}
                                                        >
                                                            <Star size={16} fill={isFavorite(getWordKey(selectedWord.id)) ? 'currentColor' : 'none'} />
                                                            {isFavorite(getWordKey(selectedWord.id)) ? 'Favorilerde' : 'Favorile'}
                                                        </button>
                                                        <button
                                                            onClick={() => setShowNoteInput(!showNoteInput)}
                                                            className="flex-1 py-2 bg-white/20 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/30 transition-colors"
                                                        >
                                                            <StickyNote size={16} />
                                                            Not Ekle
                                                        </button>
                                                    </div>

                                                    {showNoteInput && (
                                                        <div className="space-y-2">
                                                            <input
                                                                type="text"
                                                                value={noteInput}
                                                                onChange={(e) => setNoteInput(e.target.value)}
                                                                placeholder="Notunuzu yazın..."
                                                                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:border-amber-500"
                                                                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                                                            />
                                                            <button
                                                                onClick={handleAddNote}
                                                                className="w-full py-2 bg-blue-500 text-white rounded-lg font-bold text-sm hover:bg-blue-600 transition-colors"
                                                            >
                                                                Notu Kaydet
                                                            </button>
                                                        </div>
                                                    )}

                                                    {getNote(getWordKey(selectedWord.id)) && (
                                                        <div className="p-3 bg-white/10 rounded-lg border border-white/20">
                                                            <div className="text-[10px] font-bold text-white/50 uppercase mb-1">Notunuz</div>
                                                            <p className="text-sm text-white">{getNote(getWordKey(selectedWord.id))?.note}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-100 rounded-2xl text-center text-gray-400">
                                        <PenTool size={48} className="mb-4 text-gray-200" />
                                        <p className="text-lg font-medium">Pratik yapmaya başlayın</p>
                                        <p className="text-sm mt-2">Görsel üzerindeki bir kelimeye tıklayarak tahmin yapın.</p>
                                    </div>
                                )}

                                {/* Tüm Satırı Göster */}
                                <div className="space-y-4">
                                    <button
                                        onClick={() => setShowFullLine(!showFullLine)}
                                        className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border-2 ${showFullLine
                                            ? 'bg-amber-50 border-amber-300 text-amber-700'
                                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {showFullLine ? <EyeOff size={18} /> : <Eye size={18} />}
                                        {showFullLine ? 'Cevapları Gizle' : 'Tüm Satırı Göster'}
                                    </button>

                                    {showFullLine && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="p-4 bg-amber-50 border border-amber-200 rounded-xl"
                                        >
                                            <h4 className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-3">Tüm Kelimelerin Latinize Karşılıkları</h4>
                                            <div className="space-y-2">
                                                {doc.tokens.map((token) => (
                                                    <div key={token.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-amber-100">
                                                        <span className="text-xl script-font text-gray-700" dir="rtl">{token.original}</span>
                                                        <span className="text-lg font-bold text-amber-700">→ {token.modern}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Kelime Durumu Özeti */}
                                <div>
                                    <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4">Kelime Durumu</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {doc.tokens.map((token) => {
                                            const attempted = attemptedWords.has(token.id);
                                            const isCorrect = attemptedWords.get(token.id);
                                            return (
                                                <button
                                                    key={token.id}
                                                    onClick={() => setSelectedWord(token)}
                                                    className={`px-3 py-1.5 rounded text-sm transition-all ${attempted
                                                        ? isCorrect
                                                            ? 'bg-green-100 text-green-700 ring-1 ring-green-500'
                                                            : 'bg-red-100 text-red-700 ring-1 ring-red-500'
                                                        : selectedWord?.id === token.id
                                                            ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-700'
                                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {attempted ? (isCorrect ? '✓' : '✗') : '?'} {token.original}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {view === 'fulltext' && (
                        <motion.div key="fulltext" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 px-4 sm:px-12">
                            <div className="max-w-3xl mx-auto space-y-16 text-center">
                                <div>
                                    <h3 className="text-xs font-black uppercase text-gray-300 tracking-widest mb-6">Orijinal Metin</h3>
                                    <div className="text-4xl sm:text-5xl script-font leading-loose text-gray-900" dir="rtl">
                                        {doc.tokens.map(t => t.original).join(' ')}
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-4">
                                    <div className="h-px bg-gray-100 w-full" />
                                    <span className="text-gray-300 text-xs font-black uppercase tracking-widest whitespace-nowrap">Çeviri</span>
                                    <div className="h-px bg-gray-100 w-full" />
                                </div>

                                <div>
                                    <div className="text-xl sm:text-2xl font-serif leading-relaxed text-gray-700">
                                        {doc.tokens.map(t => t.modern).join(' ')}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Hata Bildirimi Modalı */}
            {showErrorModal && selectedWord && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
                    >
                        {!errorSubmitted ? (
                            <>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                        <AlertTriangle size={24} className="text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Hata Bildir</h3>
                                        <p className="text-gray-500 text-sm">Bu kelimenin latinizasyonunun yanlış olduğunu düşünüyorsanız bize bildirin.</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="text-xs font-bold text-gray-400 uppercase mb-2">Mevcut Latinizasyon</div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl script-font" dir="rtl">{selectedWord.original}</span>
                                            <span className="text-xl font-bold text-gray-700">→ {selectedWord.modern}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Sizce Doğru Karşılık</label>
                                        <input
                                            type="text"
                                            value={errorSuggestion}
                                            onChange={(e) => setErrorSuggestion(e.target.value)}
                                            placeholder="Örn: devlet"
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-orange-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Açıklama (İsteğe bağlı)</label>
                                        <textarea
                                            value={errorNote}
                                            onChange={(e) => setErrorNote(e.target.value)}
                                            placeholder="Neden bu şekilde düşündüğünüzü açıklayabilirsiniz..."
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-orange-500 resize-none"
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowErrorModal(false);
                                            setErrorSuggestion('');
                                            setErrorNote('');
                                        }}
                                        className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                    >
                                        Vazgeç
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!errorSuggestion.trim()) {
                                                alert('Lütfen doğru olduğunu düşündüğünüz karşılığı yazın.');
                                                return;
                                            }
                                            addErrorReport({
                                                documentId: doc.id,
                                                documentTitle: doc.title,
                                                wordId: selectedWord.id,
                                                originalWord: selectedWord.original,
                                                currentModern: selectedWord.modern,
                                                suggestedModern: errorSuggestion.trim(),
                                                reporterNote: errorNote.trim()
                                            });
                                            setErrorSubmitted(true);
                                        }}
                                        className="flex-1 py-3 px-4 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Send size={18} /> Gönder
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check size={32} className="text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Teşekkürler!</h3>
                                <p className="text-gray-500 mb-6">Geri bildiriminiz yöneticilere iletildi.</p>
                                <button
                                    onClick={() => {
                                        setShowErrorModal(false);
                                        setErrorSuggestion('');
                                        setErrorNote('');
                                        setErrorSubmitted(false);
                                    }}
                                    className="py-3 px-6 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
                                >
                                    Kapat
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
};

