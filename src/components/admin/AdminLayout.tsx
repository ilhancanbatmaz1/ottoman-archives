import { useState, useEffect, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
    LayoutDashboard, Users, FileText, MessageSquare, Plus,
    Menu, X, LogOut, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminLayoutProps {
    children: ReactNode;
}

interface NavItem {
    path: string;
    label: string;
    icon: React.ElementType;
}

const navItems: NavItem[] = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Kullanıcılar', icon: Users },
    { path: '/admin/documents', label: 'Belgeler', icon: FileText },
    { path: '/admin/documents/new', label: 'Yeni Belge', icon: Plus },
    { path: '/admin/reports', label: 'Hata Raporları', icon: MessageSquare },
];

export const AdminLayout = ({ children }: AdminLayoutProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { logout } = useAdminAuth();

    // Check screen size to manage state if needed, but CSS is preferred for display
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Breadcrumb'ı path'ten oluştur
    const getBreadcrumbs = () => {
        const pathParts = location.pathname.split('/').filter(Boolean);
        const breadcrumbs = pathParts.map((part, index) => {
            const path = '/' + pathParts.slice(0, index + 1).join('/');
            const item = navItems.find(nav => nav.path === path);
            return {
                label: item?.label || part.charAt(0).toUpperCase() + part.slice(1),
                path
            };
        });
        return breadcrumbs;
    };

    const breadcrumbs = getBreadcrumbs();

    const sidebarVariants = {
        open: { x: 0 },
        closed: { x: '-100%' },
        desktop: { x: 0 }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && isMobile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={isMobile ? "closed" : "desktop"}
                animate={isMobile ? (sidebarOpen ? "open" : "closed") : "desktop"}
                variants={sidebarVariants}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                className="fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col"
            >
                {/* Logo/Header */}
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-white font-black">
                                O
                            </div>
                            <span className="font-black text-lg">Admin Panel</span>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${isActive
                                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/50'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer/Logout */}
                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg font-medium transition-all"
                    >
                        <LogOut size={20} />
                        <span>Çıkış Yap</span>
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Menu size={24} />
                            </button>

                            {/* Breadcrumb */}
                            <div className="flex items-center gap-2 text-sm">
                                {breadcrumbs.map((crumb, index) => (
                                    <div key={crumb.path} className="flex items-center gap-2">
                                        {index > 0 && <ChevronRight size={16} className="text-gray-400" />}
                                        {index === breadcrumbs.length - 1 ? (
                                            <span className="font-bold text-gray-900">{crumb.label}</span>
                                        ) : (
                                            <Link
                                                to={crumb.path}
                                                className="text-gray-500 hover:text-gray-900 transition-colors"
                                            >
                                                {crumb.label}
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Quick Actions */}
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/"
                                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    Ana Siteye Dön
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};
