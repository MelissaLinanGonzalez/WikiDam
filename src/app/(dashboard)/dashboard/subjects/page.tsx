import Link from 'next/link';
import prisma from '@/lib/prisma';
import * as LucideIcons from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getSubjects() {
    const subjects = await prisma.subject.findMany({
        include: {
            _count: {
                select: {
                    resources: true,
                    youtubers: true,
                    doubts: true,
                },
            },
        },
        orderBy: { name: 'asc' },
    });
    return subjects;
}

export default async function SubjectsPage() {
    const subjects = await getSubjects();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Asignaturas
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Explora los recursos organizados por asignatura
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject) => {
                    const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[subject.icon || 'FolderOpen'] || LucideIcons.FolderOpen;

                    return (
                        <Link
                            key={subject.id}
                            href={`/dashboard/subjects/${subject.id}`}
                            className="group block bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 transition-all"
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                                    style={{ backgroundColor: subject.color || '#6366f1' }}
                                >
                                    <IconComponent className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                        {subject.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                                        {subject.description || 'Sin descripción'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    <strong className="text-slate-900 dark:text-white">{subject._count.resources}</strong> recursos
                                </span>
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    <strong className="text-slate-900 dark:text-white">{subject._count.youtubers}</strong> youtubers
                                </span>
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    <strong className="text-slate-900 dark:text-white">{subject._count.doubts}</strong> dudas
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {subjects.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <LucideIcons.FolderOpen className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
                    <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
                        No hay asignaturas
                    </h3>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                        Las asignaturas se crearán al ejecutar el seed.
                    </p>
                </div>
            )}
        </div>
    );
}
