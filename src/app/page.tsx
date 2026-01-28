import Link from 'next/link';
import { BookOpen, Users, FolderOpen, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
    return (
        <main className="min-h-screen">
            {/* Hero Section - Mobile First */}
            <div className="relative overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-purple-600 to-pink-500" />

                {/* Animated background shapes - Smaller on mobile */}
                <div className="absolute inset-0 opacity-20 sm:opacity-30">
                    <div className="absolute top-10 left-4 sm:top-20 sm:left-20 w-40 h-40 sm:w-72 sm:h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse" />
                    <div className="absolute top-20 right-4 sm:top-40 sm:right-20 w-40 h-40 sm:w-72 sm:h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700" />
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-40 h-40 sm:w-72 sm:h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000" />
                </div>

                {/* Content */}
                <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-24 mx-auto max-w-7xl">
                    {/* Navigation - Mobile Optimized */}
                    <nav className="flex justify-between items-center mb-8 sm:mb-12 lg:mb-16">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                            <span className="text-xl sm:text-2xl font-bold text-white">WikiDam</span>
                        </div>
                        {/* Desktop Nav Buttons - Hidden on Mobile */}
                        <div className="hidden sm:flex items-center gap-4">
                            <Link
                                href="/login"
                                className="px-4 py-2 text-white hover:text-white/80 transition-colors font-medium"
                            >
                                Iniciar Sesión
                            </Link>
                            <Link
                                href="/login?register=true"
                                className="px-6 py-2.5 bg-white text-primary-600 rounded-full font-semibold hover:bg-white/90 transition-all hover:scale-105 active:scale-100"
                            >
                                Registrarse
                            </Link>
                        </div>
                    </nav>

                    {/* Hero Content */}
                    <div className="text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 mb-5 sm:mb-6 text-xs sm:text-sm font-medium text-white/90 bg-white/10 rounded-full backdrop-blur-sm">
                            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>Plataforma colaborativa para estudiantes 2º DAM</span>
                        </div>

                        {/* Main Title - Mobile First Sizing */}
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-5 sm:mb-6 tracking-tight leading-tight">
                            Tu Wiki de
                            <span className="block bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                                Recursos DAM
                            </span>
                        </h1>

                        {/* Description - Adjusted for Mobile */}
                        <p className="max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-white/80 mb-8 sm:mb-10 px-2">
                            Comparte y descubre recursos educativos: vídeos, PDFs, enlaces y más.
                            Organizado por asignaturas y YouTubers favoritos.
                        </p>

                        {/* CTA Buttons - FULL WIDTH on Mobile, Inline on Desktop */}
                        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4 sm:px-0">
                            <Link
                                href="/login?register=true"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-4 bg-white text-primary-600 rounded-full font-semibold text-base sm:text-lg hover:bg-white/90 transition-all hover:scale-105 active:scale-100 shadow-lg shadow-black/25 touch-manipulation"
                            >
                                Comenzar Gratis
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href="/login"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-4 bg-white/10 text-white rounded-full font-semibold text-base sm:text-lg hover:bg-white/20 transition-all backdrop-blur-sm border border-white/20 touch-manipulation"
                            >
                                Ya tengo cuenta
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section - Mobile First Grid */}
            <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900">
                <div className="max-w-7xl mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-10 sm:mb-12 lg:mb-16">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 px-2">
                            Todo lo que necesitas para aprender
                        </h2>
                        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 px-4">
                            Recursos organizados y accesibles para tu formación
                        </p>
                    </div>

                    {/* Feature Cards Grid - 1 col mobile, 2 col tablet, 3 col desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        {/* Feature 1 */}
                        <div className="group p-6 sm:p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 active:scale-[0.98] touch-manipulation">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 mb-4 sm:mb-6 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FolderOpen className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2 sm:mb-3">
                                Organizado por Asignaturas
                            </h3>
                            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                                Acceso a Datos, Desarrollo de Interfaces, Android... todos los recursos clasificados por materia.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="group p-6 sm:p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 active:scale-[0.98] touch-manipulation">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 mb-4 sm:mb-6 bg-gradient-to-br from-purple-500 to-pink-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2 sm:mb-3">
                                YouTubers Favoritos
                            </h3>
                            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                                Encuentra los mejores canales de YouTube recomendados por tus compañeros.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="group p-6 sm:p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 md:col-span-2 lg:col-span-1 active:scale-[0.98] touch-manipulation">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 mb-4 sm:mb-6 bg-gradient-to-br from-amber-500 to-orange-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2 sm:mb-3">
                                Múltiples Formatos
                            </h3>
                            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                                Vídeos, PDFs, imágenes, enlaces... sube y comparte cualquier tipo de recurso.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section - Mobile Optimized */}
            <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 px-2">
                        ¿Listo para empezar?
                    </h2>
                    <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-8 sm:mb-10 px-4">
                        Únete a la comunidad de estudiantes DAM y comparte tus recursos favoritos.
                    </p>
                    <div className="px-4 sm:px-0">
                        <Link
                            href="/login?register=true"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-4 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-full font-semibold text-base sm:text-lg hover:opacity-90 transition-all hover:scale-105 active:scale-100 shadow-lg touch-manipulation"
                        >
                            Crear cuenta gratis
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer - Mobile Friendly */}
            <footer className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 bg-slate-900 border-t border-slate-800">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 text-slate-400">
                        <BookOpen className="w-5 h-5" />
                        <span className="font-medium">WikiDam</span>
                    </div>
                    <p className="text-slate-500 text-xs sm:text-sm text-center">
                        © 2024 WikiDam. Hecho con ❤️ para estudiantes DAM.
                    </p>
                </div>
            </footer>
        </main>
    );
}
