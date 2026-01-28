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
    const [detectedCategory, setDetectedCategory] = useState<string | null>(null);

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
        setDetectedCategory(null);

        try {
            const result = await analyzeUrl(url);

            if (result.success && result.categoryId) {
                // Añadir la categoría detectada si no está ya seleccionada
                if (!selectedCategories.includes(result.categoryId)) {
                    setSelectedCategories(prev => [...prev, result.categoryId!]);
                }
                setDetectedCategory(result.categoryName || null);

                // Auto-rellenar título si está vacío
                if (!title && result.title) {
                    setTitle(result.title);
                }

                // Auto-rellenar descripción si está vacía
                if (!description && result.description) {
                    setDescription(result.description.substring(0, 300));
                }
            } else if (!result.success && result.error) {
                console.warn('Análisis fallido:', result.error);
            }
        } catch (err) {
            console.error('Error en auto-detección:', err);
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

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                <form onSubmit={handleSubmit} className="space-y-6">
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
                                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${type === rt.value
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                                        }`}
                                >
                                    <rt.icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{rt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* URL (for YouTube/Link) - CON AUTO-DETECT */}
                    {needsUrl && (
                        <div>
                            <label htmlFor="url" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                {type === 'VIDEO_YOUTUBE' ? 'URL del vídeo de YouTube' : 'URL del enlace'}
                            </label>
                            <div className="flex gap-2">
                                <input
                                    id="url"
                                    type="url"
                                    value={url}
                                    onChange={(e) => {
                                        setUrl(e.target.value);
                                        setDetectedCategory(null);
                                    }}
                                    onBlur={() => {
                                        // Auto-detectar al perder el foco si hay URL válida
                                        if (url && url.startsWith('http') && categories.length > 0) {
                                            handleAutoDetect();
                                        }
                                    }}
                                    className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder={type === 'VIDEO_YOUTUBE' ? 'https://www.youtube.com/watch?v=...' : 'https://example.com'}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={handleAutoDetect}
                                    disabled={!url || !url.startsWith('http') || analyzing}
                                    className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 flex-shrink-0"
                                    title="Detectar categoría automáticamente"
                                >
                                    {analyzing ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-4 h-4" />
                                    )}
                                    <span className="hidden sm:inline">Detectar</span>
                                </button>
                            </div>

                            {/* Feedback de detección */}
                            {analyzing && (
                                <p className="mt-2 text-sm text-purple-600 dark:text-purple-400 flex items-center gap-2">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Analizando URL...
                                </p>
                            )}
                            {detectedCategory && !analyzing && (
                                <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                                    <Sparkles className="w-3 h-3" />
                                    Categoría detectada: <strong>{detectedCategory}</strong>
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
                                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
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

                    {/* Categories (optional) */}
                    {categories.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Categorías temáticas (opcional)
                            </label>
                            <div className="flex flex-wrap gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded-lg max-h-32 overflow-y-auto">
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
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${isSelected
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/40'
                                                }`}
                                        >
                                            {isSelected ? <Check className="w-3.5 h-3.5" /> : <Hash className="w-3.5 h-3.5" />}
                                            {category.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Submit buttons */}
                    <div className="flex gap-4 pt-4">
                        <Link
                            href="/dashboard/resources"
                            className="flex-1 py-3 text-center border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={loading || uploading || (needsFile && !filePath)}
                            className="flex-1 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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