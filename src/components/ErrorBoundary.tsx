import { Component, type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined });
        window.location.reload(); // Force reload on reset which is often safer
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100"
                    >
                        <div className="text-6xl mb-4">😔</div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Bir Hata Oluştu</h2>
                        <p className="text-gray-500 mb-8">
                            Uygulama çalışırken beklenmedik bir sorunla karşılaştık.
                        </p>

                        {this.state.error && (
                            <div className="mb-8 text-left bg-red-50 p-4 rounded-xl border border-red-100">
                                <div className="text-xs font-bold text-red-800 uppercase tracking-wider mb-2">Hata Detayı</div>
                                <pre className="text-xs text-red-600 overflow-auto max-h-32 font-mono whitespace-pre-wrap break-all">
                                    {this.state.error.message}
                                </pre>
                            </div>
                        )}

                        <button
                            onClick={this.handleReset}
                            className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-amber-900/20"
                        >
                            Sayfayı Yenile
                        </button>
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}
