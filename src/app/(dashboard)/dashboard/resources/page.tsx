import Link from 'next/link';
import prisma from '@/lib/prisma';
import { FileText, Video, Image, LinkIcon, Youtube, Plus, Filter } from 'lucide-react';
import { ResourceType } from '@prisma/client';
export const dynamic = 'force-dynamic';

async function getResources() {
    const resources = await prisma.resource.findMany({
        include: {
            subject: true,
            youtuber: true,
            author: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
    return resources;
}

const typeIcons: Record<ResourceType, React.ComponentType<{ className?: string }>> = {
    VIDEO_YOUTUBE: Youtube,
    VIDEO_FILE: Video,
    PDF: FileText,
    IMAGE: Image,
    LINK: LinkIcon,
};

const typeColors: Record<ResourceType, string> = {
    VIDEO_YOUTUBE: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    VIDEO_FILE: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    PDF: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    IMAGE: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    LINK: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
};

const typeLabels: Record<ResourceType, string> = {
    VIDEO_YOUTUBE: 'YouTube',
    VIDEO_FILE: 'Vídeo',
    PDF: 'PDF',
    IMAGE: 'Imagen',
    LINK: 'Enlace',
};

export default async function ResourcesPage() {
    const resources = await getResources();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Recursos
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Todos los recursos compartidos por la comunidad
                    </p>
                </div>
                <Link
                    href="/dashboard/resources/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Añadir recurso
                </Link>
            </div>

            {/* Filter chips */}
            <div className="flex flex-wrap gap-2">
                {Object.entries(typeLabels).map(([type, label]) => {
                    const TypeIcon = typeIcons[type as ResourceType];
                    return (
                        <span
                            key={type}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${typeColors[type as ResourceType]}`}
                        >
                            <TypeIcon className="w-3.5 h-3.5" />
                            {label}
                        </span>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map((resource) => {
                    const TypeIcon = typeIcons[resource.type];
                    return (
                        <Link
                            key={resource.id}
                            href={`/dashboard/resources/${resource.id}`}
                            className="group block bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 transition-all"
                        >
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${typeColors[resource.type]}`}>
                                        <TypeIcon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                            {resource.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                            {resource.description || 'Sin descripción'}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400 truncate">
                                        {resource.subject.name}
                                    </span>
                                    <span className="text-slate-400 dark:text-slate-500">
                                        por {resource.author.name}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {resources.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <Filter className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
                    <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
                        No hay recursos
                    </h3>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                        ¡Sé el primero en compartir un recurso!
                    </p>
                    <Link
                        href="/dashboard/resources/new"
                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Añadir recurso
                    </Link>
                </div>
            )}
        </div>
    );
}
