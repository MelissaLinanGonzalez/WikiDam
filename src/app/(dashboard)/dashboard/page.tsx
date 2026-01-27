import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
    FolderOpen,
    Youtube,
    FileText,
    Users,
    TrendingUp,
    Clock,
} from 'lucide-react';

async function getStats() {
    const [subjectsCount, youtubersCount, resourcesCount, usersCount, recentResources] = await Promise.all([
        prisma.subject.count(),
        prisma.youtuber.count(),
        prisma.resource.count(),
        prisma.user.count(),
        prisma.resource.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                author: { select: { name: true, image: true } },
                subject: { select: { name: true, color: true } },
                categories: true,
            },
        }),
    ]);

    return { subjectsCount, youtubersCount, resourcesCount, usersCount, recentResources };
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    const stats = await getStats();

    const statCards = [
        {
            label: 'Asignaturas',
            value: stats.subjectsCount,
            icon: FolderOpen,
            color: 'from-blue-500 to-cyan-400',
        },
        {
            label: 'YouTubers',
            value: stats.youtubersCount,
            icon: Youtube,
            color: 'from-red-500 to-pink-400',
        },
        {
            label: 'Recursos',
            value: stats.resourcesCount,
            icon: FileText,
            color: 'from-green-500 to-emerald-400',
        },
        {
            label: 'Usuarios',
            value: stats.usersCount,
            icon: Users,
            color: 'from-purple-500 to-violet-400',
        },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome section */}
            <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-8 text-white">
                <h1 className="text-3xl font-bold mb-2">
                    ¡Hola, {session.user?.name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-white/80 text-lg">
                    Bienvenido a WikiDam. Explora y comparte recursos con la comunidad.
                </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                            {stat.value}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Recent resources */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Recursos recientes
                    </h2>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {stats.recentResources.length > 0 ? (
                        stats.recentResources.map((resource) => (
                            <div key={resource.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium text-slate-900 dark:text-white">
                                            {resource.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {resource.subject?.name ?? resource.categories[0]?.name ?? 'General'} · por {resource.author?.name ?? 'Anónimo'}
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full">
                                        {resource.type.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                            No hay recursos todavía. ¡Sé el primero en compartir!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
