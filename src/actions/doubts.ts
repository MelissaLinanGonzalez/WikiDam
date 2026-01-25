'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Types for the Doubt with relations
export type DoubtWithRelations = Awaited<ReturnType<typeof getDoubtById>>;
export type DoubtListItem = Awaited<ReturnType<typeof getDoubts>>[number];

/**
 * Create a new doubt
 */
export async function createDoubt(data: {
    title: string;
    description: string;
    attachments: string[];
    subjectIds: string[];
    categoryIds?: string[];
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { error: 'No autorizado' };
    }

    if (!data.title || data.title.trim().length < 3) {
        return { error: 'El título debe tener al menos 3 caracteres' };
    }

    if (!data.description || data.description.trim().length < 10) {
        return { error: 'La descripción debe tener al menos 10 caracteres' };
    }

    if ((!data.subjectIds || data.subjectIds.length === 0) && (!data.categoryIds || data.categoryIds.length === 0)) {
        return { error: 'Debes seleccionar al menos una asignatura o una categoría' };
    }

    try {
        const doubt = await prisma.doubt.create({
            data: {
                title: data.title.trim(),
                description: data.description.trim(),
                attachments: data.attachments,
                authorId: session.user.id,
                ...(data.subjectIds && data.subjectIds.length > 0 && {
                    subjects: {
                        connect: data.subjectIds.map(id => ({ id })),
                    },
                }),
                ...(data.categoryIds && data.categoryIds.length > 0 && {
                    categories: {
                        connect: data.categoryIds.map(id => ({ id })),
                    },
                }),
            },
            include: {
                author: { select: { id: true, name: true } },
                subjects: { select: { id: true, name: true, color: true } },
                categories: { select: { id: true, name: true, slug: true, icon: true } },
            },
        });

        revalidatePath('/dashboard/doubts');
        return { success: true, doubt };
    } catch (error) {
        console.error('Error creating doubt:', error);
        return { error: 'Error al crear la duda' };
    }
}

/**
 * Get all doubts ordered by creation date (newest first)
 */
export async function getDoubts() {
    try {
        const doubts = await prisma.doubt.findMany({
            include: {
                author: { select: { id: true, name: true } },
                subjects: { select: { id: true, name: true, color: true } },
                categories: { select: { id: true, name: true, slug: true, icon: true } },
                _count: { select: { comments: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return doubts;
    } catch (error) {
        console.error('Error fetching doubts:', error);
        return [];
    }
}

/**
 * Get a single doubt by ID with all comments
 */
export async function getDoubtById(id: string) {
    try {
        const doubt = await prisma.doubt.findUnique({
            where: { id },
            include: {
                author: { select: { id: true, name: true, image: true } },
                subjects: { select: { id: true, name: true, color: true } },
                categories: { select: { id: true, name: true, slug: true, icon: true } },
                comments: {
                    include: {
                        author: { select: { id: true, name: true, image: true } },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        return doubt;
    } catch (error) {
        console.error('Error fetching doubt:', error);
        return null;
    }
}

/**
 * Close a doubt - Only the author or an ADMIN can close
 */
export async function closeDoubt(doubtId: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { error: 'No autorizado' };
    }

    try {
        const doubt = await prisma.doubt.findUnique({
            where: { id: doubtId },
            select: { authorId: true, status: true },
        });

        if (!doubt) {
            return { error: 'Duda no encontrada' };
        }

        if (doubt.status === 'CLOSED') {
            return { error: 'La duda ya está cerrada' };
        }

        // Check if user is author or admin
        const isAuthor = doubt.authorId === session.user.id;
        const isAdmin = session.user.role === 'ADMIN';

        if (!isAuthor && !isAdmin) {
            return { error: 'Solo el autor o un administrador puede cerrar la duda' };
        }

        await prisma.doubt.update({
            where: { id: doubtId },
            data: { status: 'CLOSED' },
        });

        revalidatePath('/dashboard/doubts');
        revalidatePath(`/dashboard/doubts?id=${doubtId}`);
        return { success: true };
    } catch (error) {
        console.error('Error closing doubt:', error);
        return { error: 'Error al cerrar la duda' };
    }
}

/**
 * Create a comment on a doubt
 */
export async function createComment(data: {
    doubtId: string;
    content: string;
    attachments: string[];
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { error: 'No autorizado' };
    }

    if (!data.content || data.content.trim().length < 1) {
        return { error: 'El comentario no puede estar vacío' };
    }

    try {
        // Check if doubt exists and is open
        const doubt = await prisma.doubt.findUnique({
            where: { id: data.doubtId },
            select: { status: true },
        });

        if (!doubt) {
            return { error: 'Duda no encontrada' };
        }

        if (doubt.status === 'CLOSED') {
            return { error: 'No se pueden añadir comentarios a una duda cerrada' };
        }

        const comment = await prisma.comment.create({
            data: {
                content: data.content.trim(),
                attachments: data.attachments,
                authorId: session.user.id,
                doubtId: data.doubtId,
            },
            include: {
                author: { select: { id: true, name: true, image: true } },
            },
        });

        revalidatePath('/dashboard/doubts');
        revalidatePath(`/dashboard/doubts?id=${data.doubtId}`);
        return { success: true, comment };
    } catch (error) {
        console.error('Error creating comment:', error);
        return { error: 'Error al crear el comentario' };
    }
}

/**
 * Get all subjects for the subject selector
 */
export async function getSubjectsForDoubt() {
    try {
        const subjects = await prisma.subject.findMany({
            select: { id: true, name: true, color: true },
            orderBy: { name: 'asc' },
        });
        return subjects;
    } catch (error) {
        console.error('Error fetching subjects:', error);
        return [];
    }
}

/**
 * Delete a doubt - Only the author or an ADMIN can delete
 */
export async function deleteDoubt(doubtId: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { error: 'No autorizado' };
    }

    try {
        const doubt = await prisma.doubt.findUnique({
            where: { id: doubtId },
            select: { authorId: true },
        });

        if (!doubt) {
            return { error: 'Duda no encontrada' };
        }

        // Check if user is author or admin
        const isAuthor = doubt.authorId === session.user.id;
        const isAdmin = session.user.role === 'ADMIN';

        if (!isAuthor && !isAdmin) {
            return { error: 'Solo el autor o un administrador puede eliminar la duda' };
        }

        await prisma.doubt.delete({
            where: { id: doubtId },
        });

        revalidatePath('/dashboard/doubts');
        return { success: true };
    } catch (error) {
        console.error('Error deleting doubt:', error);
        return { error: 'Error al eliminar la duda' };
    }
}
