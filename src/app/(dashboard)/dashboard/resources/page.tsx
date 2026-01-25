import Link from 'next/link';
import prisma from '@/lib/prisma';
import { FileText, Video, Image, LinkIcon, Youtube, Plus, Filter, Hash, X } from 'lucide-react';
import { ResourceType, Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface FilterParams {
    category?: string;
    subjectId?: string;
}

async function getResources(filters: FilterParams = {}) {
    const where: Prisma.ResourceWhereInput = {};

    // Filter by category slug
    if (filters.category) {
        where.categories = {
            some: { slug: filters.category }
        };
    }

    // Filter by subject
    if (filters.subjectId) {
        where.subjectId = filters.subjectId;
    }

    const resources = await prisma.resource.findMany({
        where,
        include: {
            subject: true,
            youtuber: true,
            author: { select: { id: true, name: true } },
            categories: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
    return resources;
}

async function getCategoryBySlug(slug: string) {
    return prisma.category.findUnique({
        where: { slug },
        select: { name: true, slug: true }
    });
}

async function getSubjectById(id: string) {
    return prisma.subject.findUnique({
        where: { id },
        select: { name: true, id: true }
    });
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

interface PageProps {
    searchParams: { category?: string; subjectId?: string };
}

export default async function ResourcesPage({ searchParams }: PageProps) {
    const resources = await getResources({
        category: searchParams.category,
        subjectId: searchParams.subjectId,
    });

    // Get filter names for display
    const activeCategory = searchParams.category ? await getCategoryBySlug(searchParams.category) : null;
    const activeSubject = searchParams.subjectId ? await getSubjectById(searchParams.subjectId) : null;
    const hasFilters = !!searchParams.category || !!searchParams.subjectId;

    // Build dynamic title
    let pageTitle = 'Recursos';
    if (activeCategory && activeSubject) {
        pageTitle = `Recursos de ${activeCategory.name} en ${activeSubject.name}`;
    } else if (activeCategory) {
        pageTitle = `Recursos de ${activeCategory.name}`;
    } else if (activeSubject) {
        pageTitle = `Recursos de ${activeSubject.name}`;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {pageTitle}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        {hasFilters
                            ? `${resources.length} recurso${resources.length !== 1 ? 's' : ''} encontrado${resources.length !== 1 ? 's' : ''}`
                            : 'Todos los recursos compartidos por la comunidad'
                        }
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

            {/* Active filters */}
            {hasFilters && (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Filtros activos:</span>
                    {activeCategory && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                            <Hash className="w-3 h-3" />
                            {activeCategory.name}
                        </span>
                    )}
                    {activeSubject && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm">
                            {activeSubject.name}
                        </span>
                    )}
                    <Link
                        href="/dashboard/resources"
                        className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                        <X className="w-3 h-3" />
                        Limpiar filtros
                    </Link>
                </div>
            )}

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
                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                                            {resource.subject && (
                                                <span
                                                    className="px-2 py-0.5 rounded-full text-xs font-medium truncate"
                                                    style={{
                                                        backgroundColor: resource.subject.color ? `${resource.subject.color}20` : '#f1f5f9',
                                                        color: resource.subject.color || '#64748b',
                                                    }}
                                                >
                                                    {resource.subject.name}
                                                </span>
                                            )}
                                            {!resource.subject && resource.categories && resource.categories.length > 0 && (
                                                <span className="text-slate-500 dark:text-slate-400 text-xs italic">
                                                    Solo categorías
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-slate-400 dark:text-slate-500 ml-2 flex-shrink-0">
                                            por {resource.author.name}
                                        </span>
                                    </div>
                                    {resource.categories && resource.categories.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {resource.categories.slice(0, 3).map((category) => (
                                                <span
                                                    key={category.id}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                                >
                                                    <Hash className="w-2.5 h-2.5" />
                                                    {category.name}
                                                </span>
                                            ))}
                                            {resource.categories.length > 3 && (
                                                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-500">
                                                    +{resource.categories.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}
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
                        {hasFilters ? 'No hay recursos con estos filtros' : 'No hay recursos'}
                    </h3>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                        {hasFilters
                            ? 'Intenta con otros filtros o limpia los actuales'
                            : '¡Sé el primero en compartir un recurso!'
                        }
                    </p>
                    {hasFilters ? (
                        <Link
                            href="/dashboard/resources"
                            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
                        >
                            <X className="w-4 h-4" />
                            Limpiar filtros
                        </Link>
                    ) : (
                        <Link
                            href="/dashboard/resources/new"
                            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Añadir recurso
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
