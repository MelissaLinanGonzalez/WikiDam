import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET single subject
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const subject = await prisma.subject.findUnique({
            where: { id },
            include: {
                youtubers: true,
                resources: {
                    include: {
                        author: { select: { name: true } },
                        youtuber: { select: { name: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!subject) {
            return NextResponse.json(
                { error: 'Asignatura no encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json(subject);
    } catch (error) {
        console.error('Error fetching subject:', error);
        return NextResponse.json(
            { error: 'Error al obtener la asignatura' },
            { status: 500 }
        );
    }
}

// PUT update subject (Admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { name, description, icon, color } = body;

        const subject = await prisma.subject.update({
            where: { id },
            data: {
                name,
                description,
                icon,
                color,
            },
        });

        return NextResponse.json(subject);
    } catch (error) {
        console.error('Error updating subject:', error);
        return NextResponse.json(
            { error: 'Error al actualizar la asignatura' },
            { status: 500 }
        );
    }
}

// DELETE subject (Admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 403 }
            );
        }

        await prisma.subject.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Asignatura eliminada' });
    } catch (error) {
        console.error('Error deleting subject:', error);
        return NextResponse.json(
            { error: 'Error al eliminar la asignatura' },
            { status: 500 }
        );
    }
}
