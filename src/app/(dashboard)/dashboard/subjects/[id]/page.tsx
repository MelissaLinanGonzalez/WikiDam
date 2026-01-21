import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import * as LucideIcons from 'lucide-react';
import { ArrowLeft, Youtube, FileText, Video, Image, LinkIcon, MessageCircle, Lock, Unlock } from 'lucide-react';
import { ResourceType } from '@prisma/client';

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getSubject(id: string) {
    const subject = await prisma.subject.findUnique({
        where: { id },
        include: {
            youtubers: true,
            resources: {
                include: {
                    author: { select: { name: true } },
                    youtuber: { select: { name: true } },
                },
                orderBy: { createdAt: 'desc' },
            },
            doubts: {
                include: {
                    author: { select: { name: true } },
                    _count: { select: { comments: true } },
                },
                orderBy: { createdAt: 'desc' },
            },
        },
    });
    return subject;
}

const typeIcons: Record<ResourceType, React.ComponentType<{ className?: string }>> = {
    VIDEO_YOUTUBE: Youtube,
    VIDEO_FILE: Video,
    PDF: FileText,
    IMAGE: Image,
    LINK: LinkIcon,
};

const typeLabels: Record<ResourceType, string> = {
    VIDEO_YOUTUBE: 'YouTube',
    VIDEO_FILE: 'Vídeo',
    PDF: 'PDF',
    IMAGE: 'Imagen',
    LINK: 'Enlace',
};

export default async function SubjectDetailPage({ params }: PageProps) {
    const { id } = await params;
    const subject = await getSubject(id);

    if (!subject) {
        notFound();
    }

    const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[subject.icon || 'FolderOpen'] || LucideIcons.FolderOpen;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/subjects"
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </Link>
                <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: subject.color || '#6366f1' }}
                >
                    <IconComponent className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {subject.name}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        {subject.description || 'Sin descripción'}
                    </p>
                </div>
            </div>

            {/* YouTubers */}
            {subject.youtubers.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Youtube className="w-5 h-5 text-red-500" />
                        YouTubers recomendados
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {subject.youtubers.map((youtuber) => (
                            <a
                                key={youtuber.id}
                                href={youtuber.channelUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            >
                                <Youtube className="w-4 h-4" />
                                {youtuber.name}
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Resources */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Recursos ({subject.resources.length})
                    </h2>
                    <Link
                        href={`/dashboard/resources/new?subjectId=${subject.id}`}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                    >
                        Añadir recurso
                    </Link>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {subject.resources.length > 0 ? (
                        subject.resources.map((resource) => {
                            const TypeIcon = typeIcons[resource.type];
                            return (
                                <Link
                                    key={resource.id}
                                    href={`/dashboard/resources/${resource.id}`}
                                    className="block p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                            <TypeIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-slate-900 dark:text-white truncate">
                                                {resource.title}
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {typeLabels[resource.type]}
                                                {resource.youtuber && ` · ${resource.youtuber.name}`}
                                                {` · por ${resource.author.name}`}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                            No hay recursos en esta asignatura todavía.
                        </div>
                    )}
                </div>
            </div>

            {/* Doubts */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-primary-500" />
                        Dudas ({subject.doubts.length})
                    </h2>
                    <Link
                        href="/dashboard/doubts"
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                    >
                        Ver foro
                    </Link>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {subject.doubts.length > 0 ? (
                        subject.doubts.map((doubt) => (
                            <Link
                                key={doubt.id}
                                href={`/dashboard/doubts?id=${doubt.id}`}
                                className="block p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${doubt.status === 'OPEN'
                                            ? 'bg-green-100 dark:bg-green-900/30'
                                            : 'bg-slate-100 dark:bg-slate-700'
                                        }`}>
                                        {doubt.status === 'OPEN' ? (
                                            <Unlock className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        ) : (
                                            <Lock className="w-5 h-5 text-slate-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-slate-900 dark:text-white truncate">
                                            {doubt.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            por {doubt.author.name} · {doubt._count.comments} respuestas
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${doubt.status === 'OPEN'
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                        }`}>
                                        {doubt.status === 'OPEN' ? 'Abierta' : 'Cerrada'}
                                    </span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                            No hay dudas relacionadas con esta asignatura.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
