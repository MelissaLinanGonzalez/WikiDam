import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET all youtubers
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const subjectId = searchParams.get('subjectId');

        const youtubers = await prisma.youtuber.findMany({
            where: subjectId ? { subjectId } : undefined,
            include: {
                subject: true,
                _count: {
                    select: { resources: true },
                },
            },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json(youtubers);
    } catch (error) {
        console.error('Error fetching youtubers:', error);
        return NextResponse.json(
            { error: 'Error al obtener los youtubers' },
            { status: 500 }
        );
    }
}

// POST create youtuber
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, channelUrl, subjectId } = body;

        if (!name || !channelUrl || !subjectId) {
            return NextResponse.json(
                { error: 'Nombre, URL del canal y asignatura son requeridos' },
                { status: 400 }
            );
        }

        const youtuber = await prisma.youtuber.create({
            data: {
                name,
                channelUrl,
                subjectId,
            },
            include: {
                subject: true,
            },
        });

        return NextResponse.json(youtuber, { status: 201 });
    } catch (error) {
        console.error('Error creating youtuber:', error);
        return NextResponse.json(
            { error: 'Error al crear el youtuber' },
            { status: 500 }
        );
    }
}
