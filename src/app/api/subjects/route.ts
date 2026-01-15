import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET all subjects
export async function GET() {
    try {
        const subjects = await prisma.subject.findMany({
            include: {
                _count: {
                    select: {
                        resources: true,
                        youtubers: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json(subjects);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        return NextResponse.json(
            { error: 'Error al obtener las asignaturas' },
            { status: 500 }
        );
    }
}

// POST create subject (Admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { name, description, icon, color } = body;

        if (!name) {
            return NextResponse.json(
                { error: 'El nombre es requerido' },
                { status: 400 }
            );
        }

        const subject = await prisma.subject.create({
            data: {
                name,
                description,
                icon,
                color,
            },
        });

        return NextResponse.json(subject, { status: 201 });
    } catch (error) {
        console.error('Error creating subject:', error);
        return NextResponse.json(
            { error: 'Error al crear la asignatura' },
            { status: 500 }
        );
    }
}
