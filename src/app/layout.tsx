import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'WikiDam - Wiki para Estudiantes DAM',
    description: 'Plataforma colaborativa para compartir recursos educativos de Desarrollo de Aplicaciones Multiplataforma',
    keywords: ['DAM', 'wiki', 'educación', 'programación', 'desarrollo'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es" suppressHydrationWarning>
            <body className={inter.className}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
