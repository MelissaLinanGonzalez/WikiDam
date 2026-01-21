'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
            } else {
                router.push('/dashboard');
                router.refresh();
            }
        } catch {
            setError('Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2 mb-8">
                            <BookOpen className="w-8 h-8 text-primary-600" />
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">WikiDam</span>
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                            Bienvenido de nuevo
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Inicia sesión para acceder a tus recursos
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder="tu@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Iniciar Sesión
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* --- SECCIÓN GOOGLE AÑADIDA --- */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">O continúa con</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                        className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-medium bg-white dark:bg-slate-800"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Iniciar sesión con Google
                    </button>
                    {/* --- FIN SECCIÓN GOOGLE --- */}

                    <p className="mt-8 text-center text-slate-600 dark:text-slate-400">
                        ¿No tienes cuenta?{' '}
                        <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                            Regístrate gratis
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right side - Decorative */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 via-purple-600 to-pink-500 items-center justify-center p-8">
                <div className="text-center text-white max-w-md">
                    <h2 className="text-4xl font-bold mb-4">
                        Aprende con recursos de calidad
                    </h2>
                    <p className="text-xl text-white/80">
                        Accede a la mejor colección de recursos educativos compartidos por estudiantes como tú.
                    </p>
                </div>
            </div>
        </div>
    );
}