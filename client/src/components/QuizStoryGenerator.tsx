import React, { useState } from 'react';
import { CheckSquare } from 'lucide-react';

const InputGroup = ({ label, value, onChange, dir = 'ltr', font = '' }: any) => (
    <div className="space-y-1">
        <label className="text-xs font-bold text-stone-500 uppercase">{label}</label>
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            dir={dir}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-amber-500 outline-none ${font}`}
        />
    </div>
);

export const QuizStoryGenerator = () => {
    const [question, setQuestion] = useState('Bu kelime nasıl okunur?');
    const [word, setWord] = useState('مكتب');
    const [optionA, setOptionA] = useState('Mektep');
    const [optionB, setOptionB] = useState('Mektup');
    const [bgType, setBgType] = useState('light');

    const bgs: any = {
        light: "bg-[#f8f5f2] text-stone-800 border-stone-300",
        dark: "bg-stone-900 text-amber-50 border-stone-700",
        green: "bg-[#2d4a3e] text-[#e8f3ee] border-[#4a6b5d]"
    };

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 h-fit">
                <h2 className="text-lg font-bold text-stone-700 border-b pb-2 mb-4 flex items-center gap-2">
                    <CheckSquare size={18} /> Story Anket Hazırlayıcı
                </h2>
                <div className="space-y-4">
                    <InputGroup label="Soru Metni" value={question} onChange={setQuestion} />
                    <InputGroup label="Soru Kelimesi (Osmanlıca)" value={word} onChange={setWord} dir="rtl" font="font-matbu text-2xl" />

                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Seçenek A (Doğru)" value={optionA} onChange={setOptionA} />
                        <InputGroup label="Seçenek B (Yanlış)" value={optionB} onChange={setOptionB} />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Arka Plan</label>
                        <div className="flex gap-2">
                            {Object.keys(bgs).map(b => (
                                <button key={b} onClick={() => setBgType(b)} className={`flex-1 py-2 text-xs font-bold capitalize border rounded ${bgType === b ? 'ring-2 ring-amber-500' : ''} ${bgs[b].split(' ')[0]}`}>
                                    {b}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-stone-200 rounded-xl">
                <div className={`w-[300px] h-[533px] shadow-2xl relative flex flex-col items-center p-8 text-center border-8 border-double transition-colors ${bgs[bgType]}`}>

                    <div className="absolute top-6 w-full text-center opacity-50 text-[10px] uppercase tracking-[0.3em]">
                        İlhan ile Osmanlıca
                    </div>

                    <div className="mt-16 mb-8 w-full">
                        <h3 className="text-lg font-bold leading-tight mb-8 px-2 opacity-90">{question}</h3>

                        <div className="w-full aspect-square flex items-center justify-center bg-black/5 rounded-3xl border-2 border-current mb-4 relative">
                            <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-current opacity-50"></div>
                            <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-current opacity-50"></div>
                            <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-current opacity-50"></div>
                            <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-current opacity-50"></div>

                            <span className="text-7xl font-rika" dir="rtl">{word}</span>
                        </div>
                    </div>

                    <div className="w-full mt-auto mb-12">
                        <div className="border-2 border-dashed border-current/30 rounded-lg p-4 relative">
                            <p className="text-[10px] opacity-50 uppercase tracking-widest mb-2">Anket Sticker Alanı</p>
                            <div className="flex flex-col gap-2 opacity-50">
                                <div className="bg-white/20 h-10 rounded flex items-center px-4 text-sm font-bold">{optionA}</div>
                                <div className="bg-white/20 h-10 rounded flex items-center px-4 text-sm font-bold">{optionB}</div>
                            </div>
                            <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 rotate-90 text-2xl animate-bounce">👇</div>
                        </div>
                    </div>

                </div>
                <p className="mt-4 text-xs text-stone-500 w-[300px] text-center">
                    Bu görseli indirin, Instagram Story'e atın ve işaretli alana "Anket" çıkartmasını ekleyin.
                </p>
            </div>
        </div>
    );
};
