import { useLearning } from '../context/LearningContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, Medal, Crown, User } from 'lucide-react';

export const LeaderboardPage = () => {
    const { leaderboard, profile } = useLearning();

    const getMedalIcon = (position: number) => {
        switch (position) {
            case 0:
                return <Crown className="text-yellow-500" size={24} />;
            case 1:
                return <Medal className="text-gray-400" size={24} />;
            case 2:
                return <Medal className="text-amber-600" size={24} />;
            default:
                return <span className="text-lg font-bold text-gray-400 w-6 text-center">{position + 1}</span>;
        }
    };

    const getRowStyle = (position: number, isUser: boolean) => {
        if (isUser) {
            return 'bg-amber-50 border-amber-300 ring-2 ring-amber-200';
        }
        switch (position) {
            case 0:
                return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300';
            case 1:
                return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300';
            case 2:
                return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300';
            default:
                return 'bg-white border-gray-100';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
            {/* Header */}
            <nav className="sticky top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft size={20} />
                        <span className="font-bold">Ana Sayfa</span>
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Trophy className="text-purple-600" size={24} />
                        Liderlik Tablosu
                    </h1>
                    <div className="w-20" />
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
                {/* Top 3 Podium */}
                <div className="flex justify-center items-end gap-4 py-8">
                    {/* 2nd Place */}
                    {leaderboard[1] && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                                <User size={32} className="text-gray-500" />
                            </div>
                            <div className="text-sm font-bold text-gray-700 text-center max-w-[80px] truncate">
                                {leaderboard[1].name}
                            </div>
                            <div className="text-xs text-gray-500">{leaderboard[1].score} XP</div>
                            <div className="w-20 h-24 bg-gradient-to-t from-gray-300 to-gray-200 rounded-t-lg mt-2 flex items-center justify-center">
                                <span className="text-3xl font-black text-white">2</span>
                            </div>
                        </motion.div>
                    )}

                    {/* 1st Place */}
                    {leaderboard[0] && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex flex-col items-center"
                        >
                            <Crown className="text-yellow-500 mb-1" size={32} />
                            <div className="w-20 h-20 bg-yellow-200 rounded-full flex items-center justify-center mb-2 ring-4 ring-yellow-400">
                                <User size={40} className="text-yellow-600" />
                            </div>
                            <div className="text-sm font-bold text-gray-900 text-center max-w-[100px] truncate">
                                {leaderboard[0].name}
                            </div>
                            <div className="text-xs text-yellow-600 font-bold">{leaderboard[0].score} XP</div>
                            <div className="w-24 h-32 bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-t-lg mt-2 flex items-center justify-center">
                                <span className="text-4xl font-black text-white">1</span>
                            </div>
                        </motion.div>
                    )}

                    {/* 3rd Place */}
                    {leaderboard[2] && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-14 h-14 bg-amber-200 rounded-full flex items-center justify-center mb-2">
                                <User size={28} className="text-amber-600" />
                            </div>
                            <div className="text-sm font-bold text-gray-700 text-center max-w-[80px] truncate">
                                {leaderboard[2].name}
                            </div>
                            <div className="text-xs text-gray-500">{leaderboard[2].score} XP</div>
                            <div className="w-16 h-16 bg-gradient-to-t from-amber-400 to-amber-300 rounded-t-lg mt-2 flex items-center justify-center">
                                <span className="text-2xl font-black text-white">3</span>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Full Leaderboard */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-100">
                        <h3 className="font-bold text-gray-700">Haftalık Sıralama</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {leaderboard.map((entry, index) => {
                            const isUser = entry.name.includes('(Sen)');
                            return (
                                <motion.div
                                    key={entry.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`flex items-center gap-4 p-4 border-l-4 ${getRowStyle(index, isUser)}`}
                                >
                                    <div className="w-8 flex justify-center">
                                        {getMedalIcon(index)}
                                    </div>
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                        <User size={20} className={isUser ? 'text-amber-600' : 'text-gray-400'} />
                                    </div>
                                    <div className="flex-1">
                                        <div className={`font-bold ${isUser ? 'text-amber-700' : 'text-gray-800'}`}>
                                            {entry.name}
                                        </div>
                                    </div>
                                    <div className={`font-bold ${isUser ? 'text-amber-600' : 'text-gray-600'}`}>
                                        {entry.score} XP
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Join CTA if no profile */}
                {!profile.name && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-purple-50 border border-purple-200 rounded-2xl p-6 text-center"
                    >
                        <Trophy size={48} className="mx-auto text-purple-400 mb-4" />
                        <h3 className="text-lg font-bold text-purple-900 mb-2">Sıralamaya Katıl!</h3>
                        <p className="text-sm text-purple-700 mb-4">
                            İlerleme sayfasından adınızı girin ve liderlik tablosunda yerinizi alın.
                        </p>
                        <Link
                            to="/progress"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
                        >
                            Profil Oluştur
                        </Link>
                    </motion.div>
                )}
            </main>
        </div>
    );
};
