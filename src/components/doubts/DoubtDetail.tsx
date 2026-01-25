'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Lock,
    Unlock,
    User,
    Calendar,
    Paperclip,
    Send,
    AlertCircle,
    X,
    Trash2,
} from 'lucide-react';
import { useUploadThing } from '@/lib/uploadthing';
import { UserAvatar } from '@/components/UserAvatar';
import { closeDoubt, createComment, deleteDoubt } from '@/actions/doubts';
import type { DoubtWithRelations } from '@/actions/doubts';

interface DoubtDetailProps {
    doubt: DoubtWithRelations;
    onBack: () => void;
}

export default function DoubtDetail({ doubt, onBack }: DoubtDetailProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [commentText, setCommentText] = useState('');
    const [attachments, setAttachments] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [isClosing, setIsClosing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Upload hook for custom file picker
    const { startUpload, isUploading } = useUploadThing('doubtAttachmentUploader');

    // Optimistic comments for instant display
    const [optimisticComments, setOptimisticComments] = useState<Array<{
        id: string;
        content: string;
        attachments: string[];
        createdAt: Date;
        author: { id: string; name: string | null; image: string | null };
        authorId: string;
        isPending?: boolean;
    }>>([]);

    // Track previous comments count to detect when new server data arrives
    const prevCommentsCountRef = useRef(doubt?.comments?.length ?? 0);

    // Clear optimistic comments when server data arrives (comments count changes)
    useEffect(() => {
        if (doubt?.comments) {
            const currentCount = doubt.comments.length;
            if (currentCount > prevCommentsCountRef.current) {
                // New comment arrived from server, clear optimistic comments
                setOptimisticComments([]);
            }
            prevCommentsCountRef.current = currentCount;
        }
    }, [doubt?.comments]);

    if (!doubt) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-slate-500 dark:text-slate-400">Cargando...</p>
            </div>
        );
    }

    const isAuthor = session?.user?.id === doubt.authorId;
    const isAdmin = session?.user?.role === 'ADMIN';
    const canClose = (isAuthor || isAdmin) && doubt.status === 'OPEN';
    const canDelete = isAuthor || isAdmin;
    const canComment = doubt.status === 'OPEN';

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta duda? Esta acción no se puede deshacer.')) {
            return;
        }

        setIsDeleting(true);
        setError('');

        const result = await deleteDoubt(doubt.id);

        if (result.error) {
            setError(result.error);
            setIsDeleting(false);
        } else {
            router.push('/dashboard/doubts');
            router.refresh();
        }
    };

    const handleClose = async () => {
        if (!confirm('¿Estás seguro de que quieres cerrar esta duda? No se podrán añadir más respuestas.')) {
            return;
        }

        setIsClosing(true);
        setError('');

        const result = await closeDoubt(doubt.id);

        if (result.error) {
            setError(result.error);
            setIsClosing(false);
        } else {
            router.refresh();
            setIsClosing(false);
        }
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || !session?.user) return;

        const tempId = `temp-${Date.now()}`;
        const tempComment = {
            id: tempId,
            content: commentText.trim(),
            attachments: [...attachments],
            createdAt: new Date(),
            author: {
                id: session.user.id,
                name: session.user.name || 'Usuario',
                image: session.user.image || null,
            },
            authorId: session.user.id,
            isPending: true,
        };

        // Add optimistic comment immediately
        setOptimisticComments((prev) => [...prev, tempComment]);

        // Clear form immediately for better UX
        const savedContent = commentText.trim();
        const savedAttachments = [...attachments];
        setCommentText('');
        setAttachments([]);
        setError('');

        startTransition(async () => {
            const result = await createComment({
                doubtId: doubt.id,
                content: savedContent,
                attachments: savedAttachments,
            });

            if (result.error) {
                setError(result.error);
                // Remove optimistic comment on error
                setOptimisticComments((prev) => prev.filter((c) => c.id !== tempId));
                // Restore form content
                setCommentText(savedContent);
                setAttachments(savedAttachments);
            } else {
                // Mark as no longer pending, keep visible until server data arrives
                setOptimisticComments((prev) =>
                    prev.map((c) => c.id === tempId ? { ...c, isPending: false } : c)
                );
                router.refresh();
            }
        });
    };

    const removeAttachment = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('es-ES', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(date));
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className="flex items-start gap-3">
                    <button
                        onClick={onBack}
                        className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {doubt.title}
                            </h2>
                            <div className="flex items-center gap-2">
                                {doubt.status === 'OPEN' ? (
                                    <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                                        <Unlock className="w-3 h-3" />
                                        Abierta
                                    </span>
                                ) : (
                                    <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full">
                                        <Lock className="w-3 h-3" />
                                        Cerrada
                                    </span>
                                )}

                                {canClose && (
                                    <button
                                        onClick={handleClose}
                                        disabled={isClosing}
                                        className="flex items-center gap-1.5 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50 text-xs font-medium"
                                        title="Finalizar Conversación"
                                    >
                                        <Lock className="w-3 h-3" />
                                        Finalizar conversación
                                    </button>
                                )}

                                {canDelete && (
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="flex items-center gap-1.5 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50 text-xs font-medium"
                                        title="Eliminar Duda"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        {isDeleting ? 'Eliminando...' : 'Eliminar'}
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5" />
                                {doubt.author.name}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(doubt.createdAt)}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                            {doubt.subjects.map((subject: { id: string; name: string; color: string | null }) => (
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
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
                {/* Original Question */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                        <UserAvatar
                            name={doubt.author.name}
                            image={doubt.author.image}
                            className="w-8 h-8"
                        />
                        <div>
                            <p className="font-medium text-slate-900 dark:text-white text-sm">
                                {doubt.author.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {formatDate(doubt.createdAt)}
                            </p>
                        </div>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {doubt.description}
                    </p>
                    {doubt.attachments.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {doubt.attachments.map((url: string, i: number) => (
                                <a
                                    key={i}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-24 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 hover:border-primary-500 transition-colors"
                                >
                                    <img
                                        src={url}
                                        alt={`Adjunto ${i + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                {/* Comments */}
                {doubt.comments.map((comment: { id: string; content: string; attachments: string[]; createdAt: Date; author: { id: string; name: string | null; image: string | null }; authorId: string }) => (
                    <div
                        key={comment.id}
                        className={`rounded-xl p-4 shadow-sm border ${comment.authorId === doubt.authorId
                            ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 ml-4'
                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 mr-4'
                            }`}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <UserAvatar
                                name={comment.author.name}
                                image={comment.author.image}
                                className="w-7 h-7"
                            />
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white text-sm">
                                    {comment.author.name}
                                    {comment.authorId === doubt.authorId && (
                                        <span className="ml-2 text-xs text-primary-600 dark:text-primary-400">
                                            (Autor)
                                        </span>
                                    )}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {formatDate(comment.createdAt)}
                                </p>
                            </div>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap">
                            {comment.content}
                        </p>
                        {comment.attachments.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {comment.attachments.map((url: string, i: number) => (
                                    <a
                                        key={i}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 hover:border-primary-500 transition-colors"
                                    >
                                        <img
                                            src={url}
                                            alt={`Adjunto ${i + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {/* Optimistic Comments - Show immediately after sending */}
                {optimisticComments.map((comment) => (
                    <div
                        key={comment.id}
                        className={`rounded-xl p-4 shadow-sm border ml-4 ${comment.isPending
                            ? 'bg-primary-50/50 dark:bg-primary-900/10 border-primary-200/50 dark:border-primary-800/50 opacity-70'
                            : 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
                            }`}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <UserAvatar
                                name={comment.author.name}
                                image={comment.author.image}
                                className="w-7 h-7"
                            />
                            <div className="flex-1">
                                <p className="font-medium text-slate-900 dark:text-white text-sm">
                                    {comment.author.name}
                                    <span className="ml-2 text-xs text-primary-600 dark:text-primary-400">
                                        (Tú)
                                    </span>
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {comment.isPending ? 'Enviando...' : formatDate(comment.createdAt)}
                                </p>
                            </div>
                            {comment.isPending && (
                                <div className="w-4 h-4 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
                            )}
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap">
                            {comment.content}
                        </p>
                        {comment.attachments.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {comment.attachments.map((url: string, i: number) => (
                                    <div
                                        key={i}
                                        className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600"
                                    >
                                        <img
                                            src={url}
                                            alt={`Adjunto ${i + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {doubt.comments.length === 0 && optimisticComments.length === 0 && (
                    <p className="text-center text-slate-500 dark:text-slate-400 text-sm py-4">
                        No hay respuestas todavía. ¡Sé el primero en responder!
                    </p>
                )}
            </div>

            {/* Close Button (for author/admin) */}


            {/* Comment Form */}
            {canComment ? (
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    {error && (
                        <div className="flex items-center gap-2 p-3 mb-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Attachment Preview */}
                    {attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {attachments.map((url, i) => (
                                <div key={i} className="relative">
                                    <img
                                        src={url}
                                        alt={`Adjunto ${i + 1}`}
                                        className="w-16 h-16 rounded-lg object-cover border border-slate-200 dark:border-slate-600"
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

                    <form onSubmit={handleSubmitComment} className="flex items-end gap-2">
                        {/* Text Input */}
                        <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-xl px-4 py-2">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Escribe tu respuesta..."
                                rows={1}
                                className="w-full bg-transparent border-none resize-none text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-sm"
                                style={{ minHeight: '1.5rem', maxHeight: '6rem' }}
                                onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = 'auto';
                                    target.style.height = `${target.scrollHeight}px`;
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        if (commentText.trim()) {
                                            handleSubmitComment(e);
                                        }
                                    }
                                }}
                            />
                        </div>
                        {/* Attach Button - Custom icon-only file picker */}
                        <input
                            type="file"
                            id="attach-file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={async (e) => {
                                const files = e.target.files;
                                if (!files || files.length === 0) return;

                                try {
                                    const result = await startUpload(Array.from(files));
                                    if (result) {
                                        setAttachments((prev) => [...prev, ...result.map((f: { url: string }) => f.url)]);
                                    }
                                } catch (err) {
                                    setError('Error al subir archivo');
                                }
                                // Reset input
                                e.target.value = '';
                            }}
                        />
                        <label
                            htmlFor="attach-file"
                            className={`p-2.5 rounded-full cursor-pointer transition-all ${isUploading
                                ? 'bg-slate-200 dark:bg-slate-600 opacity-50 cursor-wait'
                                : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            {isUploading ? (
                                <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin" />
                            ) : (
                                <Paperclip className="w-5 h-5" />
                            )}
                        </label>
                        {/* Send Button */}
                        <button
                            type="submit"
                            disabled={isPending || !commentText.trim()}
                            className="p-2.5 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                        <Lock className="w-4 h-4" />
                        Esta conversación ha sido cerrada
                    </p>
                </div>
            )}
        </div>
    );
}
