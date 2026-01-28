// src/app/(dashboard)/dashboard/resources/page.tsx

import Link from 'next/link';
import prisma from '@/lib/prisma';
import { FileText, Video, Image, LinkIcon, Youtube, Plus, Filter, Tag, X } from 'lucide-react';
import { ResourceType, Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Tipos para los searchParams
interface ResourcesPageProps {
    searchParams: Promise<{ category?: string; subjectId?: string; type?: string }>;
}

// Función para obtener recursos con filtrado dinámico
async function getResources(filters: { category?: string; subjectId?: string; type?: string }) {
    const where: Prisma.ResourceWhereInput = {};

    // Filtro por categoría (usando slug)
    if (filters.category) {
        where.categories = {
            some: { slug: filters.category }
        };
    }

    // Filtro por asignatura
    if (filters.subjectId) {
        where.subjectId = filters.subjectId;
    }

    // Filtro por tipo de recurso
    if (filters.type && Object.values(ResourceType).includes(filters.type as ResourceType)) {
        where.type = filters.type as ResourceType;
    }

    const resources = await prisma.resource.findMany({
        where,
        include: {
            subject: true,
            youtuber: true,
            categories: true,
            author: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    return resources;
}

// Función para obtener categorías disponibles para filtros
async function getCategories() {
    return prisma.category.findMany({
        orderBy: { name: 'asc' }
    });
}

// Función para obtener asignaturas disponibles para filtros
async function getSubjects() {
    return prisma.subject.findMany({
        orderBy: { name: 'asc' }
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
    VIDEO_YOUTUBE: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
    VIDEO_FILE: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    PDF: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    IMAGE: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    LINK: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
};

const typeLabels: Record<ResourceType, string> = {
    VIDEO_YOUTUBE: 'YouTube',
    VIDEO_FILE: 'Vídeo',
    PDF: 'PDF',
    IMAGE: 'Imagen',
    LINK: 'Enlace',
};

export default async function ResourcesPage({ searchParams }: ResourcesPageProps) {
    const params = await searchParams;
    const [resources, categories, subjects] = await Promise.all([
        getResources(params),
        getCategories(),
        getSubjects(),
    ]);

    // Determinar si hay filtros activos
    const hasActiveFilters = !!(params.category || params.subjectId || params.type);

    // Generar título dinámico
    const getPageTitle = () => {
        if (params.type && typeLabels[params.type as ResourceType]) {
            return `Recursos: ${typeLabels[params.type as ResourceType]}`;
        }
        if (params.category) {
            const cat = categories.find(c => c.slug === params.category);
            return cat ? `Recursos de ${cat.name}` : 'Recursos';
        }
        if (params.subjectId) {
            const subj = subjects.find(s => s.id === params.subjectId);
            return subj ? `Recursos de ${subj.name}` : 'Recursos';
        }
        return 'Recursos';
    };

    // Generar descripción dinámica
    const getPageDescription = () => {
        if (hasActiveFilters) {
            return `Mostrando ${resources.length} recurso${resources.length !== 1 ? 's' : ''} filtrado${resources.length !== 1 ? 's' : ''}`;
        }
        return 'Todos los recursos compartidos por la comunidad';
    };

    return (
        <div className="space-y-5">
            {/* Header - Mobile First: Stack vertically on mobile, horizontal on desktop */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {getPageTitle()}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                        {getPageDescription()}
                    </p>
                </div>
                <Link
                    href="/dashboard/resources/new"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 bg-primary-600 text-white rounded-xl sm:rounded-lg hover:bg-primary-700 active:bg-primary-800 transition-colors font-medium shadow-sm touch-manipulation"
                >
                    <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
                    <span>Añadir recurso</span>
                </Link>
            </div>

            {/* Filter Chips - Horizontal Scroll Container (App-Style) */}
            <div className="space-y-3">
                {/* Type Filters - Deslizables horizontalmente */}
                <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar scroll-smooth snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
                    {Object.entries(typeLabels).map(([type, label]) => {
                        const TypeIcon = typeIcons[type as ResourceType];
                        const isActive = params.type === type;
                        const baseUrl = new URLSearchParams();

                        // Construir URL preservando otros filtros
                        if (params.category) baseUrl.set('category', params.category);
                        if (params.subjectId) baseUrl.set('subjectId', params.subjectId);

                        if (!isActive) {
                            baseUrl.set('type', type);
                        }

                        const href = baseUrl.toString() ? `/dashboard/resources?${baseUrl.toString()}` : '/dashboard/resources';

                        return (
                            <Link
                                key={type}
                                href={href}
                                className={`
                                    inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium
                                    flex-shrink-0 whitespace-nowrap snap-start
                                    border transition-all duration-200
                                    touch-manipulation active:scale-95
                                    ${isActive
                                        ? `${typeColors[type as ResourceType]} ring-2 ring-offset-2 ring-current dark:ring-offset-slate-900`
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                    }
                                `}
                            >
                                <TypeIcon className="w-4 h-4" />
                                {label}
                            </Link>
                        );
                    })}
                </div>

                {/* Active Filters + Clear Button */}
                {hasActiveFilters && (
                    <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 items-center">
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0 font-medium uppercase tracking-wide">
                            Filtros:
                        </span>

                        {/* Mostrar filtros activos como chips removibles */}
                        {params.type && (
                            <Link
                                href={(() => {
                                    const newParams = new URLSearchParams();
                                    if (params.category) newParams.set('category', params.category);
                                    if (params.subjectId) newParams.set('subjectId', params.subjectId);
                                    return newParams.toString() ? `/dashboard/resources?${newParams.toString()}` : '/dashboard/resources';
                                })()}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex-shrink-0 whitespace-nowrap hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors touch-manipulation"
                            >
                                {typeLabels[params.type as ResourceType] || params.type}
                                <X className="w-3 h-3" />
                            </Link>
                        )}

                        {params.category && (
                            <Link
                                href={(() => {
                                    const newParams = new URLSearchParams();
                                    if (params.type) newParams.set('type', params.type);
                                    if (params.subjectId) newParams.set('subjectId', params.subjectId);
                                    return newParams.toString() ? `/dashboard/resources?${newParams.toString()}` : '/dashboard/resources';
                                })()}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex-shrink-0 whitespace-nowrap hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors touch-manipulation"
                            >
                                {categories.find(c => c.slug === params.category)?.name || params.category}
                                <X className="w-3 h-3" />
                            </Link>
                        )}

                        {params.subjectId && (
                            <Link
                                href={(() => {
                                    const newParams = new URLSearchParams();
                                    if (params.type) newParams.set('type', params.type);
                                    if (params.category) newParams.set('category', params.category);
                                    return newParams.toString() ? `/dashboard/resources?${newParams.toString()}` : '/dashboard/resources';
                                })()}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex-shrink-0 whitespace-nowrap hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors touch-manipulation"
                            >
                                {subjects.find(s => s.id === params.subjectId)?.name || 'Asignatura'}
                                <X className="w-3 h-3" />
                            </Link>
                        )}

                        {/* Botón Limpiar Todo */}
                        <Link
                            href="/dashboard/resources"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex-shrink-0 whitespace-nowrap hover:bg-primary-200 dark:hover:bg-primary-800/40 transition-colors touch-manipulation active:scale-95 ml-auto"
                        >
                            <X className="w-4 h-4" />
                            Ver todo
                        </Link>
                    </div>
                )}
            </div>

            {/* Resources Grid - Responsive */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {resources.map((resource) => {
                    const TypeIcon = typeIcons[resource.type];

                    // Lógica segura para mostrar Asignatura O Categoría
                    const labelContent = resource.subject
                        ? resource.subject.name
                        : (resource.categories?.[0]?.name || 'General');

                    return (
                        <Link
                            key={resource.id}
                            href={`/dashboard/resources/${resource.id}`}
                            className="group block bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 transition-all active:scale-[0.98] touch-manipulation"
                        >
                            <div className="p-5 sm:p-6">
                                <div className="flex items-start gap-3 sm:gap-4">
                                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColors[resource.type]}`}>
                                        <TypeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors text-base">
                                            {resource.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                            {resource.description || 'Sin descripción'}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-sm gap-2">
                                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 truncate max-w-[60%]">
                                        {!resource.subject && <Tag className="w-3.5 h-3.5 flex-shrink-0" />}
                                        <span className="truncate">{labelContent}</span>
                                    </span>
                                    <span className="text-slate-400 dark:text-slate-500 text-xs whitespace-nowrap">
                                        por {resource.author.name}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Empty State */}
            {resources.length === 0 && (
                <div className="text-center py-10 sm:py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <Filter className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
                    <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
                        {hasActiveFilters ? 'No hay resultados' : 'No hay recursos'}
                    </h3>
                    <p className="mt-2 text-slate-500 dark:text-slate-400 px-4">
                        {hasActiveFilters
                            ? 'No se encontraron recursos con los filtros seleccionados'
                            : '¡Sé el primero en compartir un recurso!'
                        }
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 px-4">
                        {hasActiveFilters && (
                            <Link
                                href="/dashboard/resources"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl sm:rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium touch-manipulation"
                            >
                                <X className="w-4 h-4" />
                                Limpiar filtros
                            </Link>
                        )}
                        <Link
                            href="/dashboard/resources/new"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 bg-primary-600 text-white rounded-xl sm:rounded-lg hover:bg-primary-700 transition-colors font-medium touch-manipulation"
                        >
                            <Plus className="w-4 h-4" />
                            Añadir recurso
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}