import Link from 'next/link';
import { BookOpen, Users, FolderOpen, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-purple-600 to-pink-500" />

                {/* Animated background shapes */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse" />
                    <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700" />
                    <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000" />
                </div>

                {/* Content */}
                <div className="relative z-10 px-6 py-24 mx-auto max-w-7xl lg:py-32">
                    <nav className="flex justify-between items-center mb-16">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-8 h-8 text-white" />
                            <span className="text-2xl font-bold text-white">WikiDam</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/login"
                                className="px-4 py-2 text-white hover:text-white/80 transition-colors"
                            >
                                Iniciar Sesión
                            </Link>
                            <Link
                                href="/register"
                                className="px-6 py-2 bg-white text-primary-600 rounded-full font-semibold hover:bg-white/90 transition-all hover:scale-105"
                            >
                                Registrarse
                            </Link>
                        </div>
                    </nav>

                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium text-white/90 bg-white/10 rounded-full backdrop-blur-sm">
                            <Sparkles className="w-4 h-4" />
                            <span>Plataforma colaborativa para estudiantes 2º DAM</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                            Tu Wiki de
                            <span className="block bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                                Recursos DAM
                            </span>
                        </h1>

                        <p className="max-w-2xl mx-auto text-xl text-white/80 mb-10">
                            Comparte y descubre recursos educativos: vídeos, PDFs, enlaces y más.
                            Organizado por asignaturas y YouTubers favoritos.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 rounded-full font-semibold text-lg hover:bg-white/90 transition-all hover:scale-105 shadow-lg shadow-black/25"
                            >
                                Comenzar Gratis
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white rounded-full font-semibold text-lg hover:bg-white/20 transition-all backdrop-blur-sm border border-white/20"
                            >
                                Ya tengo cuenta
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                            Todo lo que necesitas para aprender
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            Recursos organizados y accesibles para tu formación
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="group p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700">
                            <div className="w-14 h-14 mb-6 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FolderOpen className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                                Organizado por Asignaturas
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Acceso a Datos, Desarrollo de Interfaces, Android... todos los recursos clasificados por materia.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="group p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700">
                            <div className="w-14 h-14 mb-6 bg-gradient-to-br from-purple-500 to-pink-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Users className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                                YouTubers Favoritos
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Encuentra los mejores canales de YouTube recomendados por tus compañeros.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="group p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700">
                            <div className="w-14 h-14 mb-6 bg-gradient-to-br from-amber-500 to-orange-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <BookOpen className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                                Múltiples Formatos
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Vídeos, PDFs, imágenes, enlaces... sube y comparte cualquier tipo de recurso.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        ¿Listo para empezar?
                    </h2>
                    <p className="text-xl text-slate-300 mb-10">
                        Únete a la comunidad de estudiantes DAM y comparte tus recursos favoritos.
                    </p>
                    <Link
                        href="/register"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-full font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 shadow-lg"
                    >
                        Crear cuenta gratis
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 bg-slate-900 border-t border-slate-800">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-400">
                        <BookOpen className="w-5 h-5" />
                        <span className="font-medium">WikiDam</span>
                    </div>
                    <p className="text-slate-500 text-sm">
                        © 2024 WikiDam. Hecho con ❤️ para estudiantes DAM.
                    </p>
                </div>
            </footer>
        </main>
    );
}
