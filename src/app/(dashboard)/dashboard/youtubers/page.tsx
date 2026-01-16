import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Youtube, ExternalLink, Plus } from 'lucide-react';
import DeleteYoutuberButton from '@/components/DeleteYoutuberButton';

export const dynamic = 'force-dynamic';

async function getYoutubers() {
    const youtubers = await prisma.youtuber.findMany({
        include: {
            subject: true,
            _count: {
                select: { resources: true },
            },
        },
        orderBy: { name: 'asc' },
    });
    return youtubers;
}

export default async function YoutubersPage() {
    const youtubers = await getYoutubers();
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'ADMIN';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        YouTubers
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Canales de YouTube recomendados por la comunidad
                    </p>
                </div>
                <Link
                    href="/dashboard/youtubers/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Añadir YouTuber
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {youtubers.map((youtuber) => (
                    <div
                        key={youtuber.id}
                        className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <Youtube className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                                    {youtuber.name}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {youtuber.subject.name}
                                </p>
                            </div>
                            {isAdmin && (
                                <DeleteYoutuberButton youtuberId={youtuber.id} />
                            )}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                <strong className="text-slate-900 dark:text-white">{youtuber._count.resources}</strong> recursos
                            </span>
                            <a
                                href={youtuber.channelUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                            >
                                Ver canal
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {youtubers.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <Youtube className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
                    <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
                        No hay YouTubers
                    </h3>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                        ¡Sé el primero en añadir un canal de YouTube!
                    </p>
                </div>
            )}
        </div>
    );
}

