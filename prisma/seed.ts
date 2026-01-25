import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Create admin user
    const password = process.env.ADMIN_PASSWORD;
    if (!password) throw new Error('ADMIN_PASSWORD no está definida en .env');

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@wikidam.com' },
        update: {},
        create: {
            name: 'Administrador',
            email: 'admin@wikidam.com',
            password: hashedPassword,
            role: Role.ADMIN,
        },
    });
    console.log('✅ Admin user created:', admin.email);

    // Create 2º DAM subjects
    const subjects = [
        {
            name: 'Acceso a Datos',
            description: 'Técnicas de acceso a datos desde aplicaciones, incluyendo JDBC, JPA, Hibernate y manejo de ficheros.',
            icon: 'Database',
            color: '#3B82F6',
        },
        {
            name: 'Desarrollo de Interfaces',
            description: 'Desarrollo de interfaces gráficas de usuario con JavaFX, usabilidad y diseño de aplicaciones.',
            icon: 'Layout',
            color: '#8B5CF6',
        },
        {
            name: 'Programación Multimedia y Dispositivos Móviles',
            description: 'Desarrollo de aplicaciones móviles nativas con Android y Kotlin.',
            icon: 'Smartphone',
            color: '#10B981',
        },
        {
            name: 'Programación de Servicios y Procesos',
            description: 'Programación concurrente, hilos, comunicaciones en red y servicios.',
            icon: 'Server',
            color: '#F59E0B',
        },
        {
            name: 'Sistemas de Gestión Empresarial',
            description: 'Implantación y desarrollo de sistemas ERP-CRM como Odoo.',
            icon: 'Building2',
            color: '#EF4444',
        },
        {
            name: 'Empresa e Iniciativa Emprendedora',
            description: 'Creación de empresas, plan de negocio y emprendimiento.',
            icon: 'Briefcase',
            color: '#6366F1',
        },
        {
            name: 'Inglés Técnico',
            description: 'Inglés técnico para profesionales de la informática.',
            icon: 'Languages',
            color: '#EC4899',
        },
        {
            name: 'Proyecto de Desarrollo de Aplicaciones Multiplataforma',
            description: 'Proyecto final del ciclo, integración de todos los conocimientos adquiridos.',
            icon: 'Rocket',
            color: '#14B8A6',
        },
    ];

    for (const subject of subjects) {
        await prisma.subject.upsert({
            where: { name: subject.name },
            update: subject,
            create: subject,
        });
    }
    console.log(`✅ Created ${subjects.length} subjects`);

    // Create some example youtubers
    const accessoADatos = await prisma.subject.findUnique({
        where: { name: 'Acceso a Datos' }
    });

    if (accessoADatos) {
        await prisma.youtuber.upsert({
            where: { id: 'youtuber-1' },
            update: {},
            create: {
                id: 'youtuber-1',
                name: 'MoureDev',
                channelUrl: 'https://www.youtube.com/@moaborMoure',
                subjectId: accessoADatos.id,
            },
        });
        console.log('✅ Example youtuber created');
    }

    // Create default categories
    const categories = [
        { name: 'Desarrollo Frontend', slug: 'frontend', icon: 'Monitor' },
        { name: 'Backend', slug: 'backend', icon: 'Server' },
        { name: 'Ciberseguridad', slug: 'ciberseguridad', icon: 'Shield' },
        { name: 'DevOps', slug: 'devops', icon: 'GitBranch' },
        { name: 'Bases de Datos', slug: 'bases-de-datos', icon: 'Database' },
        { name: 'Inteligencia Artificial', slug: 'inteligencia-artificial', icon: 'Brain' },
        { name: 'Diseño UI/UX', slug: 'diseno-ui-ux', icon: 'Palette' },
        { name: 'Sistemas', slug: 'sistemas', icon: 'Cpu' },
    ];

    for (const category of categories) {
        await prisma.category.upsert({
            where: { slug: category.slug },
            update: category,
            create: category,
        });
    }
    console.log(`✅ Created ${categories.length} categories`);

    console.log('🎉 Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
