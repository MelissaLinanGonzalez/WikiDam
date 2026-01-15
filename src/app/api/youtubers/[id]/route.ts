import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET single youtuber
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const youtuber = await prisma.youtuber.findUnique({
            where: { id },
            include: {
                subject: true,
                resources: {
                    include: {
                        author: { select: { name: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!youtuber) {
            return NextResponse.json(
                { error: 'Youtuber no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json(youtuber);
    } catch (error) {
        console.error('Error fetching youtuber:', error);
        return NextResponse.json(
            { error: 'Error al obtener el youtuber' },
            { status: 500 }
        );
    }
}

// PUT update youtuber
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, channelUrl, subjectId } = body;

        const youtuber = await prisma.youtuber.update({
            where: { id },
            data: {
                name,
                channelUrl,
                subjectId,
            },
            include: {
                subject: true,
            },
        });

        return NextResponse.json(youtuber);
    } catch (error) {
        console.error('Error updating youtuber:', error);
        return NextResponse.json(
            { error: 'Error al actualizar el youtuber' },
            { status: 500 }
        );
    }
}

// DELETE youtuber
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

        await prisma.youtuber.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Youtuber eliminado' });
    } catch (error) {
        console.error('Error deleting youtuber:', error);
        return NextResponse.json(
            { error: 'Error al eliminar el youtuber' },
            { status: 500 }
        );
    }
}
