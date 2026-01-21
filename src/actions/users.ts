'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

interface UpdateProfileData {
    name: string;
    contactEmail?: string;
    occupation: 'STUDENT' | 'WORKER' | 'PROFESSOR';
    image?: string;
}

export async function updateProfile(data: UpdateProfileData) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            throw new Error('No autorizado');
        }

        const user = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                name: data.name,
                contactEmail: data.contactEmail || null,
                occupation: data.occupation,
                image: data.image,
            },
        });

        revalidatePath('/dashboard/profile');
        revalidatePath('/dashboard');

        return { success: true, user };
    } catch (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: 'Error al actualizar el perfil' };
    }
}
