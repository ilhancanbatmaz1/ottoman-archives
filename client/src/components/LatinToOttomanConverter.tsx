import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Copy, BookCheck } from 'lucide-react';
import { useDictionary } from '../hooks/useDictionary';

export const LatinToOttomanConverter = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const { lookupBatch } = useDictionary();

    // Helper for fallback transliteration
    const hasBackVowel = (word: string) => /[aıou]/i.test(word);

    const transliterateFallback = (word: string) => {
        const isBack = hasBackVowel(word);
        const charMap: Record<string, string> = {
            'a': isBack ? 'ا' : 'ه',
            'b': 'ب', 'c': 'ج', 'ç': 'چ', 'd': 'د', 'e': 'ه',
            'f': 'ف',
            'g': isBack ? 'غ' : 'گ',
            'ğ': 'غ', 'h': 'ه', 'ı': 'ى', 'i': 'ي',
            'j': 'ژ',
            'k': isBack ? 'ق' : 'ك',
            'l': 'ل', 'm': 'م', 'n': 'ن',
            'o': 'و', 'ö': 'و', 'p': 'پ', 'r': 'ر',
            's': isBack ? 'ص' : 'س',
            'ş': 'ش',
            't': isBack ? 'ط' : 'ت',
            'u': 'و', 'ü': 'و', 'v': 'و', 'y': 'ي', 'z': 'ز',
            ' ': ' ', '.': '.', ',': '،', '?': '؟', '0': '٠', '1': '١',
            '2': '٢', '3': '٣', '4': '٤', '5': '٥', '6': '٦', '7': '٧',
            '8': '٨', '9': '٩'
        };

        let converted = word.toLowerCase().split('').map(char => charMap[char] || char).join('');
        if (word.toLowerCase().startsWith('a')) {
            converted = 'آ' + converted.slice(1);
        }
        return converted;
    };

    useEffect(() => {
        if (!input) {
            setOutput('');
            return;
        }

        const processText = async () => {
            const words = input.split(/(\s+|[.,?!:;()])/).filter(w => w.trim().length > 0);
            const lookupWords = words.filter(w => !w.match(/^[.,?!:;()]+$/)); // Filter out punctuation for lookup

            // Batch lookup from API
            const dictionaryMap = await lookupBatch(lookupWords);

            const convertedText = input.split(/(\s+|[.,?!:;()])/).map(w => {
                if (w.trim() === '') return w; // Whitespace
                if (w.match(/^[.,?!:;()]+$/)) return w; // Punctuation (could map to Ottoman punctuation)

                const lower = w.toLowerCase();
                if (dictionaryMap[lower]) {
                    return dictionaryMap[lower];
                }
                return transliterateFallback(w);
            }).join('');

            setOutput(convertedText);
        };

        const timer = setTimeout(processText, 500); // Debounce
        return () => clearTimeout(timer);
    }, [input]);

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-stone-200">
            <div className="flex items-center gap-3 mb-6 border-b pb-4 text-stone-700">
                <ArrowRightLeft size={24} />
                <div>
                    <h2 className="text-lg font-bold">Latin {'->'} Osmanlıca (Pro)</h2>
                    <p className="text-xs text-stone-500">Veritabanı destekli akıllı çeviri motoru.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-500 uppercase">LATİN GİRİŞ (TÜRKÇE)</label>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full h-64 p-4 border-2 border-stone-200 rounded-xl focus:border-amber-500 outline-none resize-none text-stone-700 font-medium"
                        placeholder="Örn: Askerler sabah erkenden yola çıktılar..."
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-amber-700 uppercase">OSMANLICA ÇIKTI (RİK'A)</label>
                        <button onClick={handleCopy} className="text-[10px] flex items-center gap-1 text-amber-600 hover:text-amber-800 font-bold">
                            <Copy size={12} /> KOPYALA
                        </button>
                    </div>
                    <div className="w-full h-64 p-4 bg-amber-50/50 border-2 border-amber-100 rounded-xl overflow-y-auto relative">
                        {output ? (
                            <p className="text-2xl font-rika text-stone-800 leading-loose whitespace-pre-wrap" dir="rtl">
                                {output}
                            </p>
                        ) : (
                            <div className="flex items-center justify-center h-full opacity-30 text-amber-900">
                                <span className="text-4xl font-rika">عثمانليجه</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
