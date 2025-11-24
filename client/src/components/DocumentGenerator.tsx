import React, { useState } from 'react';
import { Scroll } from 'lucide-react';

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

export const DocumentGenerator = () => {
    const [header, setHeader] = useState('هو');
    const [title, setTitle] = useState('عطوفتلو افندم حضرتلري');
    const [body, setBody] = useState('معروض چاكر كمينه‌لريدر كه...\n\nبوكون تاريخنده مكتبه گيدوب افنديمزه خدمت ايتمك اوزره...\n\nباقي امر و فرمان حضرت ولي الامركدر.');
    const [date, setDate] = useState('١٥ رجب ١٣٢٠');
    const [sign, setSign] = useState('بنده ايلخان');

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 h-fit">
                <h2 className="text-lg font-bold text-stone-700 border-b pb-2 mb-4 flex items-center gap-2">
                    <Scroll size={18} /> Belge Tasarlayıcı
                </h2>
                <div className="space-y-4">
                    <InputGroup label="Serlevha (Hu/Bismihi)" value={header} onChange={setHeader} dir="rtl" font="font-rika" />
                    <InputGroup label="Elkab (Hitap)" value={title} onChange={setTitle} dir="rtl" font="font-rika" />
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-500 uppercase">Metin (Rik'a)</label>
                        <textarea value={body} onChange={(e) => setBody(e.target.value)} dir="rtl" className="w-full p-2 border rounded focus:ring-2 focus:ring-amber-500 outline-none h-32 resize-none text-xl font-rika" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Tarih" value={date} onChange={setDate} dir="rtl" font="font-rika" />
                        <InputGroup label="İmza (Bende...)" value={sign} onChange={setSign} dir="rtl" font="font-rika" />
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-stone-200 rounded-xl">
                <div className="w-[320px] min-h-[480px] paper-texture shadow-2xl relative flex flex-col p-8 text-stone-900 border border-stone-300">
                    <div className="w-full flex justify-center mb-8">
                        <span className="text-3xl font-rika opacity-80">{header}</span>
                    </div>

                    <div className="flex-1 flex flex-col space-y-6">
                        <div className="w-full text-right pr-4">
                            <span className="text-2xl font-rika font-bold">{title}</span>
                        </div>

                        <div className="text-right text-xl font-rika leading-loose whitespace-pre-wrap opacity-90 pl-2">
                            {body}
                        </div>
                    </div>

                    <div className="mt-12 flex justify-between items-end">
                        <div className="transform -rotate-12 translate-y-2">
                            <span className="text-xl font-rika">{date}</span>
                        </div>
                        <div className="text-center">
                            <span className="text-xl font-rika block">{sign}</span>
                            <div className="w-12 h-0.5 bg-stone-800 mx-auto mt-1 opacity-50 rounded-full"></div>
                        </div>
                    </div>

                    <div className="absolute top-1/3 left-0 w-full h-px bg-stone-900/5"></div>
                    <div className="absolute top-2/3 left-0 w-full h-px bg-stone-900/5"></div>
                </div>
                <p className="mt-4 text-xs text-stone-500">
                    Arşiv belgesi formatında içerik üretimi için.
                </p>
            </div>
        </div>
    );
};
