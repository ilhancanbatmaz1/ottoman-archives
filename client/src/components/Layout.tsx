import React from 'react';
import { BookOpen, Scroll, Search, FileText, CheckSquare, AlignCenter, ArrowRightLeft, Layers, Feather, Keyboard, PenTool } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const TabButton = ({ active, onClick, icon, label }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all text-xs md:text-sm font-medium whitespace-nowrap ${active
            ? 'bg-amber-100 text-amber-900 shadow-sm'
            : 'text-amber-100 hover:bg-amber-800'
            }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
    return (
        <div className="min-h-screen bg-stone-100 font-sans text-stone-800">
            <header className="bg-amber-900 text-amber-50 p-4 shadow-md sticky top-0 z-10">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <PenTool size={20} /> İlhan ile Osmanlıca
                        </h1>
                        <p className="text-xs text-amber-200 opacity-80">Dijital İçerik Atölyesi</p>
                    </div>
                    <nav className="hidden lg:flex gap-1 items-center">
                        <TabButton active={activeTab === 'generator'} onClick={() => setActiveTab('generator')} icon={<BookOpen size={16} />} label="Post" />
                        <TabButton active={activeTab === 'doc_maker'} onClick={() => setActiveTab('doc_maker')} icon={<Scroll size={16} />} label="Belge" />
                        <TabButton active={activeTab === 'dictionary'} onClick={() => setActiveTab('dictionary')} icon={<Search size={16} />} label="Lügat" />
                        <TabButton active={activeTab === 'calendar_leaf'} onClick={() => setActiveTab('calendar_leaf')} icon={<FileText size={16} />} label="Takvim" />
                        <TabButton active={activeTab === 'quiz_maker'} onClick={() => setActiveTab('quiz_maker')} icon={<CheckSquare size={16} />} label="Anket" />
                        <TabButton active={activeTab === 'poetry'} onClick={() => setActiveTab('poetry')} icon={<AlignCenter size={16} />} label="Beyit" />
                        <TabButton active={activeTab === 'converter_tool'} onClick={() => setActiveTab('converter_tool')} icon={<ArrowRightLeft size={16} />} label="Çevirici" />
                    </nav>
                </div>

                <div className="lg:hidden flex justify-between mt-4 overflow-x-auto pb-2 gap-2 scrollbar-hide">
                    <TabButton active={activeTab === 'generator'} onClick={() => setActiveTab('generator')} icon={<BookOpen size={16} />} label="Post" />
                    <TabButton active={activeTab === 'dictionary'} onClick={() => setActiveTab('dictionary')} icon={<Search size={16} />} label="Lügat" />
                    <TabButton active={activeTab === 'converter_tool'} onClick={() => setActiveTab('converter_tool')} icon={<ArrowRightLeft size={16} />} label="Çevirici" />
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
                {children}
            </main>

            <footer className="text-center text-stone-500 text-xs p-6 border-t border-stone-200 mt-8">
                <p>© 2025 İlhan ile Osmanlıca - ODTÜ Tarih Bölümü</p>
            </footer>
        </div>
    );
};
