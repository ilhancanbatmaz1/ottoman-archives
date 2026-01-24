import { type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    color?: 'amber' | 'blue' | 'green' | 'purple' | 'red' | 'orange';
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

const colorStyles = {
    amber: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: 'text-amber-600',
        text: 'text-amber-900'
    },
    blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'text-blue-600',
        text: 'text-blue-900'
    },
    green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: 'text-green-600',
        text: 'text-green-900'
    },
    purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        icon: 'text-purple-600',
        text: 'text-purple-900'
    },
    red: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: 'text-red-600',
        text: 'text-red-900'
    },
    orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        icon: 'text-orange-600',
        text: 'text-orange-900'
    }
};

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'amber', trend }: StatCardProps) => {
    const styles = colorStyles[color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${styles.bg} ${styles.border} border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 ${styles.bg} rounded-lg ring-2 ring-white`}>
                    <Icon size={24} className={styles.icon} />
                </div>
                {trend && (
                    <div className={`text-xs font-bold px-2 py-1 rounded ${trend.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {trend.isPositive ? '+' : ''}{trend.value}%
                    </div>
                )}
            </div>

            <div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    {title}
                </div>
                <div className={`text-3xl font-black ${styles.text}`}>
                    {value}
                </div>
                {subtitle && (
                    <div className="text-sm text-gray-600 mt-1">
                        {subtitle}
                    </div>
                )}
            </div>
        </motion.div>
    );
};
