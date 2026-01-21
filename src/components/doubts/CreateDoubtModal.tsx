'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { X, AlertCircle, Image as ImageIcon, Check } from 'lucide-react';
import { UploadButton } from '@/lib/uploadthing';
import { createDoubt, getSubjectsForDoubt } from '@/actions/doubts';

interface Subject {
    id: string;
    name: string;
    color: string | null;
}

interface CreateDoubtModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateDoubtModal({ isOpen, onClose }: CreateDoubtModalProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [attachments, setAttachments] = useState<string[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [error, setError] = useState('');
    const [loadingSubjects, setLoadingSubjects] = useState(true);

    useEffect(() => {
        if (isOpen) {
            getSubjectsForDoubt().then((data) => {
                setSubjects(data);
                setLoadingSubjects(false);
            });
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        startTransition(async () => {
            const result = await createDoubt({
                title,
                description,
                attachments,
                subjectIds: selectedSubjects,
            });

            if (result.error) {
                setError(result.error);
            } else {
                // Reset form
                setTitle('');
                setDescription('');
                setSelectedSubjects([]);
                setAttachments([]);
                onClose();
                router.refresh();
            }
        });
    };

    const toggleSubject = (id: string) => {
        setSelectedSubjects((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
    };

    const removeAttachment = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-t-2xl">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Nueva Duda
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label
                            htmlFor="title"
                            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                        >
                            Título
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="¿Cuál es tu duda?"
                            className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                        >
                            Descripción
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe tu duda con el mayor detalle posible..."
                            rows={4}
                            className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                            required
                        />
                    </div>

                    {/* Subject Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Asignaturas relacionadas
                        </label>
                        {loadingSubjects ? (
                            <div className="p-4 text-center text-slate-500">
                                Cargando asignaturas...
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded-lg max-h-40 overflow-y-auto">
                                {subjects.map((subject) => {
                                    const isSelected = selectedSubjects.includes(subject.id);
                                    return (
                                        <button
                                            key={subject.id}
                                            type="button"
                                            onClick={() => toggleSubject(subject.id)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${isSelected
                                                    ? 'bg-primary-600 text-white'
                                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                                }`}
                                            style={
                                                !isSelected && subject.color
                                                    ? {
                                                        backgroundColor: `${subject.color}20`,
                                                        color: subject.color,
                                                    }
                                                    : undefined
                                            }
                                        >
                                            {isSelected && <Check className="w-3.5 h-3.5" />}
                                            {subject.name}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        {selectedSubjects.length === 0 && (
                            <p className="mt-1 text-xs text-slate-500">
                                Selecciona al menos una asignatura
                            </p>
                        )}
                    </div>

                    {/* Attachments */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Capturas de pantalla (opcional)
                        </label>

                        {/* Attachment Preview */}
                        {attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {attachments.map((url, i) => (
                                    <div key={i} className="relative">
                                        <img
                                            src={url}
                                            alt={`Adjunto ${i + 1}`}
                                            className="w-20 h-20 rounded-lg object-cover border border-slate-200 dark:border-slate-600"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeAttachment(i)}
                                            className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <UploadButton
                            endpoint="doubtAttachmentUploader"
                            onClientUploadComplete={(res) => {
                                if (res) {
                                    setAttachments((prev) => [...prev, ...res.map((f) => f.url)]);
                                }
                            }}
                            onUploadError={(error) => {
                                setError(`Error al subir: ${error.message}`);
                            }}
                            appearance={{
                                button:
                                    'w-full py-2 px-4 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:border-primary-500 hover:text-primary-600 transition-colors ut-uploading:opacity-50',
                                allowedContent: 'text-xs text-slate-500 mt-1',
                            }}
                            content={{
                                button: (
                                    <span className="flex items-center justify-center gap-2">
                                        <ImageIcon className="w-4 h-4" />
                                        Subir imágenes
                                    </span>
                                ),
                            }}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || selectedSubjects.length === 0}
                            className="flex-1 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <div className="w-5 h-5 mx-auto border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Crear Duda'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
