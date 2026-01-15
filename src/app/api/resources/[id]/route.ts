import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET single resource
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const resource = await prisma.resource.findUnique({
            where: { id },
            include: {
                subject: true,
                youtuber: true,
                author: { select: { id: true, name: true, image: true } },
            },
        });

        if (!resource) {
            return NextResponse.json(
                { error: 'Recurso no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json(resource);
    } catch (error) {
        console.error('Error fetching resource:', error);
        return NextResponse.json(
            { error: 'Error al obtener el recurso' },
            { status: 500 }
        );
    }
}

// PUT update resource
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

        // Check if user owns the resource or is admin
        const existingResource = await prisma.resource.findUnique({
            where: { id },
        });

        if (!existingResource) {
            return NextResponse.json(
                { error: 'Recurso no encontrado' },
                { status: 404 }
            );
        }

        if (existingResource.authorId !== session.user.id && session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'No autorizado para editar este recurso' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { title, description, url, filePath, type, subjectId, youtuberId } = body;

        const resource = await prisma.resource.update({
            where: { id },
            data: {
                title,
                description,
                url,
                filePath,
                type,
                subjectId,
                youtuberId: youtuberId || null,
            },
            include: {
                subject: true,
                youtuber: true,
                author: { select: { id: true, name: true, image: true } },
            },
        });

        return NextResponse.json(resource);
    } catch (error) {
        console.error('Error updating resource:', error);
        return NextResponse.json(
            { error: 'Error al actualizar el recurso' },
            { status: 500 }
        );
    }
}

// DELETE resource
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        // Check if user owns the resource or is admin
        const existingResource = await prisma.resource.findUnique({
            where: { id },
        });

        if (!existingResource) {
            return NextResponse.json(
                { error: 'Recurso no encontrado' },
                { status: 404 }
            );
        }

        if (existingResource.authorId !== session.user.id && session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'No autorizado para eliminar este recurso' },
                { status: 403 }
            );
        }

        // Delete associated file if exists
        if (existingResource.filePath) {
            try {
                const fullPath = path.join(process.cwd(), 'public', existingResource.filePath);
                await fs.unlink(fullPath);
            } catch {
                console.log('File not found or already deleted');
            }
        }

        await prisma.resource.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Recurso eliminado' });
    } catch (error) {
        console.error('Error deleting resource:', error);
        return NextResponse.json(
            { error: 'Error al eliminar el recurso' },
            { status: 500 }
        );
    }
}
