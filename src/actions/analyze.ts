'use server';

import prisma from '@/lib/prisma';
import * as cheerio from 'cheerio';

/**
 * Analiza una URL y detecta automáticamente la categoría más probable
 * basándose en los metadatos de la página y las keywords de las categorías.
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

        // 1. Obtener todas las categorías CON sus keywords de la base de datos
        const categories = await prisma.category.findMany({
            select: { id: true, name: true, slug: true, keywords: true }
        });

        if (categories.length === 0) {
            return { success: false, error: 'No hay categorías definidas' };
        }

        // 2. Hacer fetch a la URL con headers de navegador real
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

        let html: string;
        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Cache-Control': 'no-cache',
                    'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
                    'Sec-Ch-Ua-Mobile': '?0',
                    'Sec-Ch-Ua-Platform': '"Windows"',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Sec-Fetch-User': '?1',
                    'Upgrade-Insecure-Requests': '1',
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

        // 3. Extraer TODOS los metadatos relevantes con Cheerio
        const $ = cheerio.load(html);

        const title = $('title').first().text().trim();
        const ogTitle = $('meta[property="og:title"]').attr('content')?.trim() || '';
        const metaDescription = $('meta[name="description"]').attr('content')?.trim() || '';
        const ogDescription = $('meta[property="og:description"]').attr('content')?.trim() || '';
        const twitterDescription = $('meta[name="twitter:description"]').attr('content')?.trim() || '';
        const keywords = $('meta[name="keywords"]').attr('content')?.trim() || '';

        // También extraer el contenido de los primeros headings
        const h1Text = $('h1').first().text().trim();

        // Concatenar todo el texto para analizar (en minúsculas)
        const textToAnalyze = [
            title,
            ogTitle,
            metaDescription,
            ogDescription,
            twitterDescription,
            keywords,
            h1Text,
            url // Incluir la URL también
        ].join(' ').toLowerCase();

        // 4. Algoritmo de match: buscar coincidencias con categorías
        let bestMatch: { categoryId: string; categoryName: string; score: number } | null = null;

        for (const category of categories) {
            let score = 0;
            const categoryNameLower = category.name.toLowerCase();
            const categorySlugLower = category.slug.toLowerCase();

            // Coincidencia con nombre de categoría (+10 puntos)
            if (textToAnalyze.includes(categoryNameLower)) {
                score += 10;
            }

            // Coincidencia con slug de categoría (+8 puntos)
            if (textToAnalyze.includes(categorySlugLower)) {
                score += 8;
            }

            // Buscar coincidencias en keywords de la BD (+3 puntos por keyword)
            for (const keyword of category.keywords) {
                if (textToAnalyze.includes(keyword.toLowerCase())) {
                    score += 3;
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
        const pageTitle = title || ogTitle || undefined;
        const pageDescription = metaDescription || ogDescription || twitterDescription || undefined;

        if (bestMatch) {
            return {
                success: true,
                categoryId: bestMatch.categoryId,
                categoryName: bestMatch.categoryName,
                title: pageTitle,
                description: pageDescription,
            };
        }

        // No se encontró categoría, pero se extrajeron los metadatos
        return {
            success: true,
            title: pageTitle,
            description: pageDescription,
        };

    } catch (error) {
        console.error('Error en analyzeUrl:', error);
        return { success: false, error: 'Error al analizar la URL' };
    }
}
