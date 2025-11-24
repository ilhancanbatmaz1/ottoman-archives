import React, { useState } from 'react';
import { AlignCenter } from 'lucide-react';

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

export const PoetryCardGenerator = () => {
    const [line1Ottoman, setLine1Ottoman] = useState('خلق ایچنده معتبر بر نسنه یوق دولت کبی');
    const [line2Ottoman, setLine2Ottoman] = useState('اولمایه دولت جهانده بر نفس صحت کبی');
    const [line1Latin, setLine1Latin] = useState('Halk içinde muteber bir nesne yok devlet gibi');
    const [line2Latin, setLine2Latin] = useState('Olmaya devlet cihanda bir nefes sıhhat gibi');

    const [poet, setPoet] = useState('Muhibbi (Kanuni)');
    const [fontStyle, setFontStyle] = useState('rika');

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                <h2 className="text-lg font-bold text-stone-700 border-b pb-2 mb-4 flex items-center gap-2">
                    <AlignCenter size={18} /> Beyit Kartı
                </h2>
                <div className="space-y-4">

                    <div className="space-y-2 p-3 bg-amber-50/50 rounded border border-amber-100">
                        <label className="block text-xs font-bold text-amber-800 uppercase">1. Mısra (Osmanlıca)</label>
                        <input
                            dir="rtl"
                            value={line1Ottoman}
                            onChange={(e) => setLine1Ottoman(e.target.value)}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-amber-500 outline-none text-lg font-rika"
                            placeholder="Osmanlıca mısra giriniz..."
                        />
                        <label className="block text-[10px] font-bold text-stone-400 uppercase mt-2">Transkripsiyon (Opsiyonel)</label>
                        <input
                            value={line1Latin}
                            onChange={(e) => setLine1Latin(e.target.value)}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                            placeholder="Latin harfli karşılığı..."
                        />
                    </div>

                    <div className="space-y-2 p-3 bg-amber-50/50 rounded border border-amber-100">
                        <label className="block text-xs font-bold text-amber-800 uppercase">2. Mısra (Osmanlıca)</label>
                        <input
                            dir="rtl"
                            value={line2Ottoman}
                            onChange={(e) => setLine2Ottoman(e.target.value)}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-amber-500 outline-none text-lg font-rika"
                            placeholder="Osmanlıca mısra giriniz..."
                        />
                        <label className="block text-[10px] font-bold text-stone-400 uppercase mt-2">Transkripsiyon (Opsiyonel)</label>
                        <input
                            value={line2Latin}
                            onChange={(e) => setLine2Latin(e.target.value)}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                            placeholder="Latin harfli karşılığı..."
                        />
                    </div>

                    <InputGroup label="Şair / Mahlas" value={poet} onChange={setPoet} />

                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Hat Stili</label>
                        <div className="flex bg-stone-100 p-1 rounded-lg gap-1">
                            <button onClick={() => setFontStyle('rika')} className={`flex-1 py-2 text-xs font-bold rounded ${fontStyle === 'rika' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500'}`}>Rik'a (El Yazısı)</button>
                            <button onClick={() => setFontStyle('talik')} className={`flex-1 py-2 text-xs font-bold rounded ${fontStyle === 'talik' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500'}`}>Talik (Edebi)</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center p-8 bg-stone-100 rounded-xl">
                <div className="w-[320px] aspect-[4/5] bg-[#fffcf5] border-8 border-double border-[#d4b483] p-6 flex flex-col items-center justify-center shadow-2xl relative">
                    <div className="absolute top-2 left-2 text-[#d4b483] opacity-50">✦</div>
                    <div className="absolute top-2 right-2 text-[#d4b483] opacity-50">✦</div>
                    <div className="absolute bottom-2 left-2 text-[#d4b483] opacity-50">✦</div>
                    <div className="absolute bottom-2 right-2 text-[#d4b483] opacity-50">✦</div>

                    <div className="flex-1 flex flex-col justify-center space-y-6 w-full text-center py-4">
                        <div>
                            <p className={`text-3xl text-stone-800 leading-loose ${fontStyle === 'talik' ? 'font-talik' : 'font-rika'}`} dir="rtl">
                                {line1Ottoman}
                            </p>
                            {line1Latin && <p className="text-[10px] text-stone-400 mt-1 font-serif italic tracking-wide">{line1Latin}</p>}
                        </div>

                        <div className="flex items-center justify-center gap-2 opacity-20">
                            <div className="h-px w-12 bg-stone-800"></div>
                            <div className="h-1.5 w-1.5 rounded-full bg-stone-800"></div>
                            <div className="h-px w-12 bg-stone-800"></div>
                        </div>

                        <div>
                            <p className={`text-3xl text-stone-800 leading-loose ${fontStyle === 'talik' ? 'font-talik' : 'font-rika'}`} dir="rtl">
                                {line2Ottoman}
                            </p>
                            {line2Latin && <p className="text-[10px] text-stone-400 mt-1 font-serif italic tracking-wide">{line2Latin}</p>}
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-stone-200 w-full text-center">
                        <span className="text-sm font-bold text-amber-800 uppercase tracking-widest">{poet}</span>
                    </div>

                    <div className="absolute bottom-1 w-full text-center">
                        <span className="text-[9px] text-stone-300 font-sans tracking-widest">@ilhanileosmanlica</span>
                    </div>
                </div>
                <p className="mt-6 text-xs text-stone-400 text-center">
                    Not: Rik'a görünümü için Osmanlıca harf girişi yapınız.
                </p>
            </div>
        </div>
    );
};
