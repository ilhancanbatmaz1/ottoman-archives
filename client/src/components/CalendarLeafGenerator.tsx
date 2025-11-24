import React, { useState } from 'react';
import { FileText } from 'lucide-react';

const InputGroup = ({ label, value, onChange, dir = 'ltr', font = '', type = 'text' }: any) => (
    <div className="space-y-1">
        <label className="text-xs font-bold text-stone-500 uppercase">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            dir={dir}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-amber-500 outline-none ${font}`}
        />
    </div>
);

export const CalendarLeafGenerator = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [word, setWord] = useState('Tebessüm');
    const [wordOttoman, setWordOttoman] = useState('تبسم');
    const [quote, setQuote] = useState('Gülümseme, sadakadır.');

    const d = new Date(date);
    const dayName = d.toLocaleDateString('tr-TR', { weekday: 'long' });
    const dayNum = d.getDate();
    const monthName = d.toLocaleDateString('tr-TR', { month: 'long' });
    const year = d.getFullYear();

    const hijriYear = Math.floor((year - 622) * 1.03068);
    const rumiYear = year - 584;

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 h-fit">
                <h2 className="text-lg font-bold text-stone-700 border-b pb-2 mb-4 flex items-center gap-2">
                    <FileText size={18} /> Takvim Yaprağı
                </h2>
                <div className="space-y-4">
                    <InputGroup type="date" label="Tarih Seçiniz" value={date} onChange={setDate} />
                    <InputGroup label="Günün Kelimesi (Latin)" value={word} onChange={setWord} />
                    <InputGroup label="Günün Kelimesi (Osmanlıca)" value={wordOttoman} onChange={setWordOttoman} dir="rtl" font="font-matbu" />
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-500 uppercase">Günün Sözü / Nüktesi</label>
                        <textarea value={quote} onChange={(e) => setQuote(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-amber-500 outline-none h-20 resize-none text-sm" />
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-stone-200 rounded-xl">
                <div className="w-[300px] h-[420px] bg-[#fdfbf7] shadow-2xl relative flex flex-col overflow-hidden text-stone-800 border border-stone-300">
                    <div className="bg-[#c92a2a] text-white p-4 text-center relative">
                        <div className="absolute top-2 left-2 text-[10px] opacity-80 uppercase tracking-widest">Hicri {hijriYear}</div>
                        <div className="absolute top-2 right-2 text-[10px] opacity-80 uppercase tracking-widest">Rumi {rumiYear}</div>
                        <h3 className="text-3xl font-bold uppercase font-classic mt-2">{monthName}</h3>
                        <p className="text-xs opacity-90 uppercase tracking-wide">{year}</p>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                        <span className="text-[120px] leading-none font-bold text-stone-800 font-classic" style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.1)' }}>
                            {dayNum}
                        </span>
                        <span className="text-xl font-bold text-[#c92a2a] uppercase tracking-widest mt-2">{dayName}</span>

                        <div className="w-full h-px bg-stone-300 my-6"></div>

                        <div className="text-center w-full">
                            <div className="flex flex-col items-center mb-2">
                                <span className="text-2xl font-rika text-stone-700" dir="rtl">{wordOttoman}</span>
                                <span className="text-xs font-bold uppercase text-stone-400 tracking-widest">{word}</span>
                            </div>
                            <p className="text-xs italic text-stone-500 px-4 leading-tight">
                                "{quote}"
                            </p>
                        </div>
                    </div>

                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-b from-black/20 to-transparent pointer-events-none"></div>
                </div>
                <p className="mt-4 text-xs text-stone-500">
                    "Günaydın" mesajları için nostaljik tasarım.
                </p>
            </div>
        </div>
    );
};
