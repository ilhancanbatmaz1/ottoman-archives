import { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Scroll, ChevronDown, BookOpen, TrendingUp, Trophy, User, Power, Loader2 } from 'lucide-react';
import { DocumentViewer } from './components/DocumentViewer';
import { InstallPrompt } from './components/InstallPrompt';
import { DocumentProvider } from './context/DocumentContext';
import { LearningProvider } from './context/LearningContext';
import { FeedbackProvider } from './context/FeedbackContext';
import { ToastProvider } from './context/ToastContext';
import { ContentProvider } from './context/ContentContext';
// Static imports removed for lazy loading
import { ReloadPrompt } from './components/ReloadPrompt';
import { HelmetProvider } from 'react-helmet-async';
import { WelcomePage } from './pages/WelcomePage';
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminProtectedRoute } from './components/admin/AdminProtectedRoute';
import type { ArchivalDocument } from './data/documents';

// Lazy Loaded Components
const ArchiveGrid = lazy(() => import('./components/ArchiveGrid').then(module => ({ default: module.ArchiveGrid })));
import { AdminLayout } from './components/admin/AdminLayout'; // Static import for Layout
const AdminLogin = lazy(() => import('./components/admin/AdminLogin').then(module => ({ default: module.AdminLogin })));
const DashboardHome = lazy(() => import('./components/admin/pages/DashboardHome').then(module => ({ default: module.DashboardHome })));
const UserManager = lazy(() => import('./components/admin/pages/UserManager').then(module => ({ default: module.UserManager })));
const DocumentManager = lazy(() => import('./components/admin/pages/DocumentManager').then(module => ({ default: module.DocumentManager })));
const ContentManager = lazy(() => import('./components/admin/pages/ContentManager'));
const DocumentEdit = lazy(() => import('./components/admin/pages/DocumentEdit').then(module => ({ default: module.DocumentEdit })));
const DocumentUpload = lazy(() => import('./components/admin/pages/DocumentUpload').then(module => ({ default: module.DocumentUpload })));
const ReportManager = lazy(() => import('./components/admin/pages/ReportManager').then(module => ({ default: module.ReportManager })));
const ProgressPage = lazy(() => import('./pages/ProgressPage').then(module => ({ default: module.ProgressPage })));
const DictionaryPage = lazy(() => import('./pages/DictionaryPage').then(module => ({ default: module.DictionaryPage })));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage').then(module => ({ default: module.LeaderboardPage })));
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(module => ({ default: module.LoginPage })));
const SignupPage = lazy(() => import('./pages/auth/SignupPage').then(module => ({ default: module.SignupPage })));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage').then(module => ({ default: module.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage').then(module => ({ default: module.ResetPasswordPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })));


// Loading Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <Loader2 className="w-10 h-10 text-amber-600 animate-spin mx-auto mb-4" />
      <p className="text-gray-500 font-medium">Yükleniyor...</p>
    </div>
  </div>
);

function PublicApp() {
  // Filters State
  const [filterDifficulty, setFilterDifficulty] = useState('Tümü');
  const [filterCategory, setFilterCategory] = useState('Tümü');
  const [filterYear, setFilterYear] = useState('Tümü');

  const [selectedDoc, setSelectedDoc] = useState<ArchivalDocument | null>(null);
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      {/* Sade Navigasyon */}
      <nav className="sticky top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">

        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* History Navigation */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded-md transition-all disabled:opacity-30"
                title="Geri"
              >
                <ChevronDown size={18} className="rotate-90" />
              </button>
              <div className="w-px h-4 bg-gray-300 mx-0.5" />
              <button
                onClick={() => navigate(1)}
                className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded-md transition-all disabled:opacity-30"
                title="İleri"
              >
                <ChevronDown size={18} className="-rotate-90" />
              </button>
            </div>

            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedDoc(null)}>
              <div className="bg-amber-700 text-white p-1.5 rounded-lg">
                <Scroll size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900 hidden sm:inline">BELGE <span className="text-amber-700">OKUMA</span></span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/progress" className="flex items-center gap-1 text-gray-500 hover:text-amber-600 transition-colors">
              <TrendingUp size={16} />
              <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">İlerleme</span>
            </Link>
            <Link to="/leaderboard" className="flex items-center gap-1 text-gray-500 hover:text-purple-600 transition-colors">
              <Trophy size={16} />
              <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Sıralama</span>
            </Link>


            {user && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <User size={16} className="text-amber-700" />
                  </div>
                  <span className="text-sm font-bold hidden md:inline">{user.username}</span>
                </div>
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isLoading) return; // Prevent double-click
                    try {
                      await logout();
                    } catch (err) {
                      console.error('Logout button error:', err);
                      // Force logout anyway
                      window.location.reload();
                    }
                  }}
                  disabled={isLoading}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Çıkış Yap"
                >
                  {isLoading ? (
                    <div className="w-[18px] h-[18px] border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Power size={18} />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {!selectedDoc ? (
          <motion.div
            key="browse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <section className="pt-20 pb-16 px-6 text-center">
              <div className="max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-widest mb-6 border border-amber-100">
                  <BookOpen size={14} /> Ücretsiz Okuma Aracı
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                  Osmanlıca Arşiv<br />
                  <span className="text-amber-700">Belgelerini Keşfedin</span>
                </h1>
                <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                  Gerçek arşiv belgeleri üzerinde okuma pratiği yapın, kelime hazinenizi geliştirin ve tarihe tanıklık edin.
                </p>

                {/* Arama ve Filtreleme */}
                <div className="bg-white p-4 rounded-2xl shadow-xl shadow-gray-100 border border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="relative">
                    <select
                      value={filterDifficulty}
                      onChange={(e) => setFilterDifficulty(e.target.value)}
                      className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:bg-white focus:border-amber-500 font-medium cursor-pointer"
                    >
                      <option>Tümü</option>
                      <option>Kolay</option>
                      <option>Orta</option>
                      <option>Zor</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                  <div className="relative">
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:bg-white focus:border-amber-500 font-medium cursor-pointer"
                    >
                      <option>Tümü</option>
                      <option>Siyasi</option>
                      <option>Edebi</option>
                      <option>Hukuki</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                  <div className="relative">
                    <select
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                      className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:bg-white focus:border-amber-500 font-medium cursor-pointer"
                    >
                      <option>Tümü</option>
                      <option>1895</option>
                      <option>1908</option>
                      <option>1915</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>
              </div>
            </section>

            <Suspense fallback={<PageLoader />}>
              <ArchiveGrid
                onSelect={setSelectedDoc}
                filters={{
                  difficulty: filterDifficulty,
                  category: filterCategory,
                  year: filterYear
                }}
              />
            </Suspense>
          </motion.div>
        ) : (
          <motion.div
            key="viewer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="h-[calc(100vh-80px)]"
          >
            <DocumentViewer doc={selectedDoc} />
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="border-t border-gray-100 py-12 text-center text-sm text-gray-400">
        <p>© 2026 Osmanlıca Okuma Yardımcısı. <br className="sm:hidden" />Tarihi sevdirmek için geliştirildi.</p>
      </footer>
    </>
  );
}

function MainRoutes() {
  const { user } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={user ? <PublicApp /> : <WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />

        {/* Admin Pages wrapped in Layout */}
        <Route path="/admin/dashboard" element={
          <AdminProtectedRoute>
            <AdminLayout>
              <DashboardHome />
            </AdminLayout>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <AdminProtectedRoute>
            <AdminLayout>
              <UserManager />
            </AdminLayout>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/documents" element={
          <AdminProtectedRoute>
            <AdminLayout>
              <DocumentManager />
            </AdminLayout>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/content" element={
          <AdminProtectedRoute>
            <AdminLayout>
              <ContentManager />
            </AdminLayout>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/documents/edit/:id" element={
          <AdminProtectedRoute>
            <AdminLayout>
              <DocumentEdit />
            </AdminLayout>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/documents/new" element={
          <AdminProtectedRoute>
            <AdminLayout>
              <DocumentUpload />
            </AdminLayout>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <AdminProtectedRoute>
            <AdminLayout>
              <ReportManager />
            </AdminLayout>
          </AdminProtectedRoute>
        } />

        {/* Protected Routes */}
        <Route path="/progress" element={
          <ProtectedRoute>
            <ProgressPage />
          </ProtectedRoute>
        } />
        <Route path="/dictionary" element={
          <ProtectedRoute>
            <DictionaryPage />
          </ProtectedRoute>
        } />
        <Route path="/leaderboard" element={
          <ProtectedRoute>
            <LeaderboardPage />
          </ProtectedRoute>
        } />


        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

// Imports checked

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <GlobalErrorBoundary>
          <AdminAuthProvider>
            <ToastProvider>
              <LearningProvider>
                <FeedbackProvider>
                  <ContentProvider>
                    <DocumentProvider>
                      <BrowserRouter>
                        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-amber-100 selection:text-amber-900">
                          <InstallPrompt />
                          <MainRoutes />
                          <ReloadPrompt />
                        </div>
                      </BrowserRouter>
                    </DocumentProvider>
                  </ContentProvider>
                </FeedbackProvider>
              </LearningProvider>
            </ToastProvider>
          </AdminAuthProvider>
        </GlobalErrorBoundary>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
