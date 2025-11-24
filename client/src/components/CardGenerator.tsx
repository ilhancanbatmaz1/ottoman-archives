import React, { useState } from 'react';
import { Layers } from 'lucide-react';

interface InputGroupProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    dir?: 'ltr' | 'rtl';
    font?: string;
    type?: string;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, value, onChange, dir = 'ltr', font = '', type = 'text' }) => (
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

export const CardGenerator = () => {
    const [word, setWord] = useState('Müverrih');
    const [ottoman, setOttoman] = useState('مورخ');
    const [meaning, setMeaning] = useState('Tarih yazan, tarihçi.');
    const [sentence, setSentence] = useState('Müverrih-i meşhur Naima Efendi...');
    const [theme, setTheme] = useState('parchment');
    const [fontStyle, setFontStyle] = useState('matbu');

    const themes: any = {
        parchment: "bg-[#f3e5ab] text-stone-900 border-4 border-double border-stone-400",
        dark: "bg-stone-900 text-amber-50 border-4 border-amber-700",
        minimal: "bg-white text-stone-800 border border-stone-200",
        royal: "bg-[#2c1810] text-[#e5cca9] border-4 border-[#e5cca9]"
    };

    const getFontClass = (style: string) => {
        switch (style) {
            case 'rika': return 'font-rika';
            case 'talik': return 'font-talik';
            default: return 'font-matbu';
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 h-fit">
                <h2 className="text-lg font-bold text-stone-700 border-b pb-2 mb-4 flex items-center gap-2">
                    <Layers size={18} /> İçerik Editörü
                </h2>

                <div className="space-y-4">
                    <InputGroup label="Kelime (Latin)" value={word} onChange={setWord} />
                    <InputGroup label="Osmanlıca" value={ottoman} onChange={setOttoman} dir="rtl" font="font-matbu text-xl" />

                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Osmanlıca Hattı</label>
                        <div className="flex bg-stone-100 p-1 rounded-lg gap-1 flex-wrap">
                            <button onClick={() => setFontStyle('matbu')} className={`flex-1 py-2 text-xs font-bold rounded flex items-center justify-center gap-2 transition-all ${fontStyle === 'matbu' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500'}`}>
                                <span className="font-matbu text-lg">م</span> Matbu
                            </button>
                            <button onClick={() => setFontStyle('rika')} className={`flex-1 py-2 text-xs font-bold rounded flex items-center justify-center gap-2 transition-all ${fontStyle === 'rika' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500'}`}>
                                <span className="font-rika text-lg">م</span> Rik'a
                            </button>
                            <button onClick={() => setFontStyle('talik')} className={`flex-1 py-2 text-xs font-bold rounded flex items-center justify-center gap-2 transition-all ${fontStyle === 'talik' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500'}`}>
                                <span className="font-talik text-lg">م</span> Talik
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-500 uppercase">Anlamı</label>
                        <textarea value={meaning} onChange={(e) => setMeaning(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-amber-500 outline-none h-20 resize-none text-sm" />
                    </div>
                    <InputGroup label="Örnek Cümle" value={sentence} onChange={setSentence} />

                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Tema</label>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.keys(themes).map((t) => (
                                <button key={t} onClick={() => setTheme(t)} className={`py-2 text-xs font-bold rounded capitalize border transition-all ${theme === t ? 'bg-amber-700 text-white border-amber-700 shadow-md' : 'bg-stone-50 text-stone-600 hover:bg-stone-100'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center justify-start pt-4">
                <div className={`w-[320px] aspect-[4/5] relative p-8 flex flex-col items-center justify-center text-center shadow-2xl transition-all duration-300 ${themes[theme]}`}>
                    <div className="absolute top-4 w-full text-center opacity-30 tracking-[0.2em] text-[10px] uppercase font-bold">Lügat-ı İlhan</div>
                    <div className="flex-1 flex flex-col justify-center w-full">
                        <div className="mb-8 transform scale-110">
                            <span className={`text-6xl ${getFontClass(fontStyle)}`} dir="rtl">{ottoman}</span>
                        </div>
                        <h2 className="text-3xl font-bold tracking-wide mb-3 uppercase">{word}</h2>
                        <div className="w-16 h-1 bg-current opacity-40 mx-auto mb-6 rounded-full"></div>
                        <p className="text-lg font-medium leading-relaxed italic opacity-90 px-2">"{meaning}"</p>
                    </div>
                    {sentence && (
                        <div className="bg-black/5 p-4 rounded-lg text-sm leading-relaxed w-full mt-4 backdrop-blur-sm">
                            <span className="font-bold block text-[10px] opacity-60 mb-1 tracking-wider">MİSAL</span>
                            <span className="font-serif">{sentence}</span>
                        </div>
                    )}
                    <div className="absolute bottom-3 text-[10px] opacity-50 font-sans tracking-widest">@ilhanileosmanlica</div>
                </div>
                <p className="mt-4 text-xs text-stone-400">Ekran görüntüsü alarak paylaşabilirsiniz.</p>
            </div>
        </div>
    );
};
