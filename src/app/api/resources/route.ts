import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ResourceType } from '@prisma/client';

// GET all resources
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const subjectId = searchParams.get('subjectId');
        const youtuberId = searchParams.get('youtuberId');
        const type = searchParams.get('type') as ResourceType | null;

        const resources = await prisma.resource.findMany({
            where: {
                ...(subjectId && { subjectId }),
                ...(youtuberId && { youtuberId }),
                ...(type && { type }),
            },
            include: {
                subject: true,
                youtuber: true,
                author: { select: { id: true, name: true, image: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(resources);
    } catch (error) {
        console.error('Error fetching resources:', error);
        return NextResponse.json(
            { error: 'Error al obtener los recursos' },
            { status: 500 }
        );
    }
}

// POST create resource
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        // ✅ CORRECCIÓN: Leemos el JSON del cuerpo de la petición
        const body = await request.json();
        
        // Ahora sí podemos extraer las variables de 'body'
        const { title, description, url, fileUrl, type, subjectId, youtuberId } = body;

        if (!title || !type || !subjectId) {
            return NextResponse.json(
                { error: 'Título, tipo y asignatura son requeridos' },
                { status: 400 }
            );
        }

        const resource = await prisma.resource.create({
            data: {
                title,
                description,
                // Si viene de UploadThing usamos fileUrl, si es un link de YouTube usamos url
                url: fileUrl || url, 
                type,
                subjectId,
                youtuberId: youtuberId || null,
                authorId: session.user.id,
            },
            include: {
                subject: true,
                youtuber: true,
                author: { select: { id: true, name: true, image: true } },
            },
        });

        return NextResponse.json(resource, { status: 201 });
    } catch (error) {
        console.error('Error creating resource:', error);
        return NextResponse.json(
            { error: 'Error al crear el recurso' },
            { status: 500 }
        );
    }
}