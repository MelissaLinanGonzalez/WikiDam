'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, AlertCircle, X, Youtube, Video, Image, LinkIcon, Hash, Check, Sparkles, Loader2 } from 'lucide-react';
import { ResourceType } from '@prisma/client';
import { UploadButton } from '@/lib/uploadthing';
import { getAllCategories } from '@/actions/categories';
import { analyzeUrl } from '@/actions/analyze';

export const dynamic = 'force-dynamic';

interface Subject {
    id: string;
    name: string;
}

interface Youtuber {
    id: string;
    name: string;
}

interface Category {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
}

const resourceTypes = [
    { value: 'VIDEO_YOUTUBE', label: 'Vídeo de YouTube', icon: Youtube },
    { value: 'VIDEO_FILE', label: 'Archivo de vídeo', icon: Video },
    { value: 'PDF', label: 'PDF', icon: FileText },
    { value: 'IMAGE', label: 'Imagen', icon: Image },
    { value: 'LINK', label: 'Enlace', icon: LinkIcon },
];

function NewResourceForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [youtubers, setYoutubers] = useState<Youtuber[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<ResourceType>('LINK');
    const [url, setUrl] = useState('');
    const [subjectId, setSubjectId] = useState(searchParams.get('subjectId') || '');
    const [youtuberId, setYoutuberId] = useState('');
    const [filePath, setFilePath] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Estado para la detección automática
    const [analyzing, setAnalyzing] = useState(false);
    const [detectionFeedback, setDetectionFeedback] = useState<{
        type: 'success' | 'warning' | null;
        message: string;
    }>({ type: null, message: '' });

    useEffect(() => {
        fetch('/api/subjects')
            .then((res) => res.json())
            .then((data) => setSubjects(data))
            .catch(() => setError('Error al cargar las asignaturas'));
        getAllCategories().then(setCategories);
    }, []);

    useEffect(() => {
        if (subjectId) {
            fetch(`/api/youtubers?subjectId=${subjectId}`)
                .then((res) => res.json())
                .then((data) => setYoutubers(data))
                .catch(() => console.error('Error loading youtubers'));
        } else {
            setYoutubers([]);
            setYoutuberId('');
        }
    }, [subjectId]);

    // Función para detectar categoría automáticamente
    const handleAutoDetect = async () => {
        if (!url || !url.startsWith('http')) {
            return;
        }

        setAnalyzing(true);
        setDetectionFeedback({ type: null, message: '' });

        try {
            const result = await analyzeUrl(url);

            if (result.success && result.categoryId) {
                // Añadir la categoría detectada si no está ya seleccionada
                if (!selectedCategories.includes(result.categoryId)) {
                    setSelectedCategories(prev => [...prev, result.categoryId!]);
                }
                setDetectionFeedback({
                    type: 'success',
                    message: `¡Tema detectado: ${result.categoryName}!`
                });

                // Auto-rellenar título si está vacío
                if (!title && result.title) {
                    setTitle(result.title);
                }

                // Auto-rellenar descripción si está vacía
                if (!description && result.description) {
                    setDescription(result.description.substring(0, 300));
                }
            } else {
                // No se encontró categoría - mensaje suave, no es un error
                setDetectionFeedback({
                    type: 'warning',
                    message: 'No se detectó el tema automáticamente. Selecciona uno manual.'
                });

                // Aún así podemos auto-rellenar título/descripción
                if (!title && result.title) {
                    setTitle(result.title);
                }
                if (!description && result.description) {
                    setDescription(result.description.substring(0, 300));
                }
            }
        } catch (err) {
            console.error('Error en auto-detección:', err);
            setDetectionFeedback({
                type: 'warning',
                message: 'Error al analizar. Selecciona el tema manualmente.'
            });
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/resources', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    type,
                    url: type === 'VIDEO_YOUTUBE' || type === 'LINK' ? url : undefined,
                    fileUrl: filePath || undefined,
                    subjectId: subjectId || undefined,
                    youtuberId: youtuberId || undefined,
                    categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Error al crear el recurso');
            } else {
                router.push('/dashboard/resources');
                router.refresh();
            }
        } catch {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const needsUrl = type === 'VIDEO_YOUTUBE' || type === 'LINK';
    const needsFile = type === 'VIDEO_FILE' || type === 'PDF' || type === 'IMAGE';

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/resources"
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Añadir recurso
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Comparte un recurso útil con la comunidad
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Type selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Tipo de recurso
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {resourceTypes.map((rt) => (
                                <button
                                    key={rt.value}
                                    type="button"
                                    onClick={() => setType(rt.value as ResourceType)}
                                    className={`flex items-center gap-2 px-3 sm:px-4 py-3 rounded-lg border transition-all touch-manipulation active:scale-[0.98] ${type === rt.value
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                                        }`}
                                >
                                    <rt.icon className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-sm font-medium truncate">{rt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* URL (for YouTube/Link) - MOBILE FIRST DESIGN */}
                    {needsUrl && (
                        <div>
                            <label htmlFor="url" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                {type === 'VIDEO_YOUTUBE' ? 'URL del vídeo de YouTube' : 'URL del enlace'}
                            </label>

                            {/* Input + Button: Stacked on mobile, side-by-side on desktop */}
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <input
                                    id="url"
                                    type="url"
                                    value={url}
                                    onChange={(e) => {
                                        setUrl(e.target.value);
                                        setDetectionFeedback({ type: null, message: '' });
                                    }}
                                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder={type === 'VIDEO_YOUTUBE' ? 'https://www.youtube.com/watch?v=...' : 'https://example.com'}
                                    required
                                />

                                {/* Detect Button - FULL WIDTH on mobile, auto on desktop */}
                                <button
                                    type="button"
                                    onClick={handleAutoDetect}
                                    disabled={!url || !url.startsWith('http') || analyzing}
                                    className="w-full sm:w-auto h-12 sm:h-auto px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 touch-manipulation active:scale-[0.98] flex-shrink-0"
                                    title="Detectar categoría automáticamente"
                                >
                                    {analyzing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Analizando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            <span>Detectar tema</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Detection Feedback */}
                            {detectionFeedback.type && (
                                <p className={`mt-3 text-sm flex items-center gap-2 ${detectionFeedback.type === 'success'
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-amber-600 dark:text-amber-400'
                                    }`}>
                                    {detectionFeedback.type === 'success' ? (
                                        <Sparkles className="w-4 h-4 flex-shrink-0" />
                                    ) : (
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    )}
                                    {detectionFeedback.message}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Título
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            placeholder="Título del recurso"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Descripción (opcional)
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                            placeholder="Describe brevemente el recurso..."
                        />
                    </div>

                    {/* File upload (for file types) */}
                    {needsFile && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Archivo
                            </label>
                            {filePath ? (
                                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                    <FileText className="w-8 h-8 text-primary-500" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900 dark:text-white truncate">
                                            Archivo subido correctamente
                                        </p>
                                        <Link href={filePath} target="_blank" className="text-xs text-primary-500 hover:underline">
                                            Ver archivo
                                        </Link>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFilePath('')}
                                        className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 touch-manipulation"
                                    >
                                        <X className="w-5 h-5 text-slate-500" />
                                    </button>
                                </div>
                            ) : (
                                <UploadButton
                                    endpoint="resourceUploader"
                                    onClientUploadComplete={(res) => {
                                        console.log("Files: ", res);
                                        if (res && res[0]) {
                                            setFilePath(res[0].url);
                                            setError('');
                                        }
                                    }}
                                    onUploadError={(error: Error) => {
                                        setError(`Error al subir: ${error.message}`);
                                    }}
                                />
                            )}
                        </div>
                    )}

                    {/* Subject */}
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Asignatura
                        </label>
                        <select
                            id="subject"
                            value={subjectId}
                            onChange={(e) => setSubjectId(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        >
                            <option value="">Selecciona una asignatura</option>
                            {subjects.map((subject) => (
                                <option key={subject.id} value={subject.id}>
                                    {subject.name}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-slate-500">
                            (Opcional si seleccionas una categoría)
                        </p>
                    </div>

                    {/* Youtuber (optional, for YouTube videos) */}
                    {type === 'VIDEO_YOUTUBE' && youtubers.length > 0 && (
                        <div>
                            <label htmlFor="youtuber" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                YouTuber (opcional)
                            </label>
                            <select
                                id="youtuber"
                                value={youtuberId}
                                onChange={(e) => setYoutuberId(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            >
                                <option value="">Selecciona un youtuber</option>
                                {youtubers.map((youtuber) => (
                                    <option key={youtuber.id} value={youtuber.id}>
                                        {youtuber.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Categories (optional) - Touch-friendly chips */}
                    {categories.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Categorías temáticas (opcional)
                            </label>
                            <div className="flex flex-wrap gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded-lg max-h-40 overflow-y-auto">
                                {categories.map((category) => {
                                    const isSelected = selectedCategories.includes(category.id);
                                    return (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() => setSelectedCategories((prev) =>
                                                prev.includes(category.id)
                                                    ? prev.filter((c) => c !== category.id)
                                                    : [...prev, category.id]
                                            )}
                                            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all touch-manipulation active:scale-95 ${isSelected
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/40'
                                                }`}
                                        >
                                            {isSelected ? <Check className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
                                            {category.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Submit buttons - Mobile friendly */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Link
                            href="/dashboard/resources"
                            className="w-full sm:flex-1 py-3 text-center border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors touch-manipulation"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={loading || uploading || (needsFile && !filePath)}
                            className="w-full sm:flex-1 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-[0.98]"
                        >
                            {loading ? (
                                <div className="w-5 h-5 mx-auto border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Añadir recurso'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function NewResourcePage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Cargando formulario...</div>}>
            <NewResourceForm />
        </Suspense>
    );
}