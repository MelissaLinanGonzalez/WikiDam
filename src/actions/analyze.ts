'use server';

import prisma from '@/lib/prisma';
import * as cheerio from 'cheerio';

/**
 * Analiza una URL y detecta automáticamente la categoría más probable
 * basándose en los metadatos de la página (título y descripción).
 */
export async function analyzeUrl(url: string): Promise<{
    success: boolean;
    categoryId?: string;
    categoryName?: string;
    title?: string;
    description?: string;
    error?: string;
}> {
    try {
        // Validar URL
        if (!url || !url.startsWith('http')) {
            return { success: false, error: 'URL inválida' };
        }

        // 1. Obtener todas las categorías de la base de datos
        const categories = await prisma.category.findMany({
            select: { id: true, name: true, slug: true }
        });

        if (categories.length === 0) {
            return { success: false, error: 'No hay categorías definidas' };
        }

        // 2. Hacer fetch a la URL con User-Agent de Chrome
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

        let html: string;
        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
                },
            });
            clearTimeout(timeout);

            if (!response.ok) {
                return { success: false, error: `Error HTTP: ${response.status}` };
            }

            html = await response.text();
        } catch (fetchError) {
            clearTimeout(timeout);
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                return { success: false, error: 'Timeout: la página tardó demasiado' };
            }
            return { success: false, error: 'No se pudo acceder a la URL' };
        }

        // 3. Extraer título y descripción con Cheerio
        const $ = cheerio.load(html);

        const pageTitle = $('title').first().text().trim() ||
            $('meta[property="og:title"]').attr('content')?.trim() || '';

        const pageDescription = $('meta[name="description"]').attr('content')?.trim() ||
            $('meta[property="og:description"]').attr('content')?.trim() || '';

        // 4. Buscar coincidencias en el texto
        const textToAnalyze = `${pageTitle} ${pageDescription}`.toLowerCase();

        // Mapeo de palabras clave adicionales para cada categoría
        const keywordsMap: Record<string, string[]> = {
            'frontend': ['react', 'vue', 'angular', 'css', 'html', 'javascript', 'typescript', 'tailwind', 'next', 'ui', 'ux', 'web'],
            'backend': ['node', 'express', 'api', 'rest', 'servidor', 'server', 'java', 'spring', 'python', 'django', 'php', 'laravel'],
            'android': ['kotlin', 'jetpack', 'compose', 'mobile', 'app', 'play store', 'gradle'],
            'ios': ['swift', 'swiftui', 'xcode', 'iphone', 'ipad', 'apple'],
            'database': ['sql', 'mysql', 'postgresql', 'mongodb', 'base de datos', 'prisma', 'orm', 'consulta'],
            'devops': ['docker', 'kubernetes', 'ci/cd', 'deploy', 'aws', 'azure', 'cloud', 'linux', 'nginx'],
            'git': ['github', 'gitlab', 'version', 'control', 'branch', 'commit', 'merge'],
            'testing': ['test', 'jest', 'testing', 'qa', 'unit', 'e2e', 'cypress'],
        };

        let bestMatch: { categoryId: string; categoryName: string; score: number } | null = null;

        for (const category of categories) {
            let score = 0;
            const categoryNameLower = category.name.toLowerCase();
            const categorySlugLower = category.slug.toLowerCase();

            // Coincidencia exacta con nombre o slug
            if (textToAnalyze.includes(categoryNameLower)) {
                score += 10;
            }
            if (textToAnalyze.includes(categorySlugLower)) {
                score += 8;
            }

            // Buscar palabras clave adicionales
            const keywords = keywordsMap[categorySlugLower] || [];
            for (const keyword of keywords) {
                if (textToAnalyze.includes(keyword)) {
                    score += 2;
                }
            }

            // Actualizar mejor coincidencia
            if (score > 0 && (!bestMatch || score > bestMatch.score)) {
                bestMatch = {
                    categoryId: category.id,
                    categoryName: category.name,
                    score
                };
            }
        }

        // 5. Devolver resultado
        if (bestMatch) {
            return {
                success: true,
                categoryId: bestMatch.categoryId,
                categoryName: bestMatch.categoryName,
                title: pageTitle || undefined,
                description: pageDescription || undefined,
            };
        }

        return {
            success: true,
            title: pageTitle || undefined,
            description: pageDescription || undefined,
            // No se encontró categoría, pero se extrajeron los metadatos
        };

    } catch (error) {
        console.error('Error en analyzeUrl:', error);
        return { success: false, error: 'Error al analizar la URL' };
    }
}
