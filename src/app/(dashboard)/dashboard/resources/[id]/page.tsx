import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth'; // <--- NUEVO
import { authOptions } from '@/lib/auth';     // <--- NUEVO
import DeleteResourceButton from '@/components/DeleteResourceButton'; // <--- NUEVO
import { ArrowLeft, Youtube, Video, FileText, Image, LinkIcon, ExternalLink, Download, User, Calendar } from 'lucide-react';
import { ResourceType } from '@prisma/client';

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getResource(id: string) {
    const resource = await prisma.resource.findUnique({
        where: { id },
        include: {
            subject: true,
            youtuber: true,
            author: { select: { id: true, name: true, image: true } },
        },
    });
    return resource;
}

const typeIcons: Record<ResourceType, React.ComponentType<{ className?: string }>> = {
    VIDEO_YOUTUBE: Youtube,
    VIDEO_FILE: Video,
    PDF: FileText,
    IMAGE: Image,
    LINK: LinkIcon,
};

const typeLabels: Record<ResourceType, string> = {
    VIDEO_YOUTUBE: 'Vídeo de YouTube',
    VIDEO_FILE: 'Archivo de vídeo',
    PDF: 'Documento PDF',
    IMAGE: 'Imagen',
    LINK: 'Enlace externo',
};

const typeColors: Record<ResourceType, string> = {
    VIDEO_YOUTUBE: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    VIDEO_FILE: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    PDF: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    IMAGE: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    LINK: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
};

function getYouTubeEmbedUrl(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default async function ResourceDetailPage({ params }: PageProps) {
    const { id } = await params;
    const resource = await getResource(id);
    const session = await getServerSession(authOptions); // <--- Obtenemos sesión

    if (!resource) {
        notFound();
    }

    // Lógica de permisos: ¿Es admin O es el dueño?
    const isAdmin = session?.user?.role === 'ADMIN';
    const isOwner = session?.user?.id === resource.authorId;
    const canDelete = isAdmin || isOwner;

    const TypeIcon = typeIcons[resource.type];
    const embedUrl = resource.type === 'VIDEO_YOUTUBE' && resource.url
        ? getYouTubeEmbedUrl(resource.url)
        : null;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/resources"
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${typeColors[resource.type]}`}>
                            <TypeIcon className="w-3.5 h-3.5" />
                            {typeLabels[resource.type]}
                        </span>
                        <Link
                            href={`/dashboard/subjects/${resource.subject.id}`}
                            className="text-sm text-slate-500 hover:text-primary-600 transition-colors"
                        >
                            {resource.subject.name}
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {resource.title}
                    </h1>
                </div>
                
                {/* --- AQUÍ ESTÁ EL BOTÓN DE BORRAR --- */}
                {canDelete && (
                    <DeleteResourceButton resourceId={resource.id} />
                )}
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                {/* YouTube embed */}
                {embedUrl && (
                    <div className="aspect-video">
                        <iframe
                            src={embedUrl}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                )}

                {/* Image preview */}
                {resource.type === 'IMAGE' && resource.filePath && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900">
                        <img
                            src={resource.filePath}
                            alt={resource.title}
                            className="max-w-full h-auto mx-auto rounded-lg"
                        />
                    </div>
                )}

                <div className="p-6 space-y-6">
                    {/* Description */}
                    {resource.description && (
                        <div>
                            <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                                Descripción
                            </h2>
                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                {resource.description}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                        {resource.url && (
                            <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Abrir enlace
                            </a>
                        )}
                        {resource.filePath && (
                            <a
                                href={resource.filePath}
                                download
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
                            >
                                <Download className="w-4 h-4" />
                                Descargar archivo
                            </a>
                        )}
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-6 pt-6 border-t border-slate-100 dark:border-slate-700 text-sm">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <User className="w-4 h-4" />
                            <span>Compartido por <strong className="text-slate-900 dark:text-white">{resource.author.name}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(resource.createdAt).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</span>
                        </div>
                        {resource.youtuber && (
                            <a
                                href={resource.youtuber.channelUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:underline"
                            >
                                <Youtube className="w-4 h-4" />
                                <span>{resource.youtuber.name}</span>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}