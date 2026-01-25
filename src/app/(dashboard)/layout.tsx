'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserAvatar } from '@/components/UserAvatar';
import { getAllCategories } from '@/actions/categories';
import {
    BookOpen,
    LayoutDashboard,
    FolderOpen,
    Youtube,
    FileText,
    MessageCircle,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronDown,
    User,
    Shield,
    Hash,
} from 'lucide-react';

interface Category {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
}

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/subjects', label: 'Asignaturas', icon: FolderOpen },
    { href: '/dashboard/youtubers', label: 'YouTubers', icon: Youtube },
    { href: '/dashboard/resources', label: 'Recursos', icon: FileText },
    { href: '/dashboard/doubts', label: 'Foro de Dudas', icon: MessageCircle },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        getAllCategories().then(setCategories);
    }, []);

    const isAdmin = session?.user?.role === 'ADMIN';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-700">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <BookOpen className="w-7 h-7 text-primary-600" />
                            <span className="text-xl font-bold text-slate-900 dark:text-white">WikiDam</span>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}

                        {/* Categories Section */}
                        {categories.length > 0 && (
                            <>
                                <div className="pt-4 pb-2">
                                    <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Explorar por Temas
                                    </p>
                                </div>
                                {categories.map((category) => (
                                    <Link
                                        key={category.id}
                                        href={`/dashboard/resources?category=${category.slug}`}
                                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm`}
                                    >
                                        <Hash className="w-4 h-4" />
                                        <span>{category.name}</span>
                                    </Link>
                                ))}
                            </>
                        )}

                        {isAdmin && (
                            <>
                                <div className="pt-4 pb-2">
                                    <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Admin
                                    </p>
                                </div>
                                <Link
                                    href="/dashboard/admin"
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname.startsWith('/dashboard/admin')
                                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    <Settings className="w-5 h-5" />
                                    <span className="font-medium">Administración</span>
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* User section */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <UserAvatar
                                    name={session?.user?.name}
                                    image={session?.user?.image}
                                    className="w-10 h-10"
                                />
                                <div className="flex-1 text-left">
                                    <p className="font-medium text-slate-900 dark:text-white truncate">
                                        {session?.user?.name || 'Usuario'}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        {isAdmin ? (
                                            <>
                                                <Shield className="w-3 h-3" />
                                                Admin
                                            </>
                                        ) : (
                                            <>
                                                <User className="w-3 h-3" />
                                                Estudiante
                                            </>
                                        )}
                                    </p>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {userMenuOpen && (
                                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                    <Link
                                        href="/dashboard/profile"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 w-full text-left"
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        <User className="w-4 h-4" />
                                        Mi Perfil
                                    </Link>
                                    <button
                                        onClick={() => signOut({ callbackUrl: '/' })}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span className="font-medium">Cerrar sesión</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between h-full px-6">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                            <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </button>
                        <div className="flex-1" />
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                {session?.user?.email}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}
