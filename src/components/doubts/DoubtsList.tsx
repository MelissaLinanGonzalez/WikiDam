'use client';

import { useState } from 'react';
import { MessageCircle, Plus, User, Lock, Unlock } from 'lucide-react';
import type { DoubtListItem } from '@/actions/doubts';

interface DoubtsListProps {
    doubts: DoubtListItem[];
    selectedDoubtId: string | null;
    onSelectDoubt: (id: string) => void;
    onNewDoubt: () => void;
}

export default function DoubtsList({
    doubts,
    selectedDoubtId,
    onSelectDoubt,
    onNewDoubt,
}: DoubtsListProps) {
    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-primary-500" />
                        Foro de Dudas
                    </h2>
                    <button
                        onClick={onNewDoubt}
                        className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        title="Nueva Duda"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {doubts.length} {doubts.length === 1 ? 'conversación' : 'conversaciones'}
                </p>
            </div>

            {/* Doubts List */}
            <div className="flex-1 overflow-y-auto">
                {doubts.length === 0 ? (
                    <div className="p-6 text-center">
                        <MessageCircle className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            No hay dudas todavía
                        </p>
                        <button
                            onClick={onNewDoubt}
                            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Crear primera duda
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {doubts.map((doubt) => (
                            <button
                                key={doubt.id}
                                onClick={() => onSelectDoubt(doubt.id)}
                                className={`w-full p-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${selectedDoubtId === doubt.id
                                        ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500'
                                        : ''
                                    }`}
                            >
                                {/* Title and Status */}
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="font-medium text-slate-900 dark:text-white line-clamp-2 text-sm">
                                        {doubt.title}
                                    </h3>
                                    {doubt.status === 'OPEN' ? (
                                        <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                                            <Unlock className="w-3 h-3" />
                                            Abierta
                                        </span>
                                    ) : (
                                        <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full">
                                            <Lock className="w-3 h-3" />
                                            Cerrada
                                        </span>
                                    )}
                                </div>

                                {/* Author */}
                                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mb-2">
                                    <User className="w-3 h-3" />
                                    <span>{doubt.author.name}</span>
                                    <span className="mx-1">·</span>
                                    <span>{doubt._count.comments} respuestas</span>
                                </div>

                                {/* Subject Badges */}
                                <div className="flex flex-wrap gap-1">
                                    {doubt.subjects.slice(0, 3).map((subject) => (
                                        <span
                                            key={subject.id}
                                            className="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                                            style={{
                                                backgroundColor: subject.color ? `${subject.color}20` : undefined,
                                                color: subject.color || undefined,
                                            }}
                                        >
                                            {subject.name}
                                        </span>
                                    ))}
                                    {doubt.subjects.length > 3 && (
                                        <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500">
                                            +{doubt.subjects.length - 3}
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
