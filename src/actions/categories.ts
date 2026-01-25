'use server';

import prisma from '@/lib/prisma';

/**
 * Get all categories for selectors and sidebar
 */
export async function getAllCategories() {
    try {
        const categories = await prisma.category.findMany({
            select: { id: true, name: true, slug: true, icon: true },
            orderBy: { name: 'asc' },
        });
        return categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}
