# WikiDam

Wiki colaborativa para estudiantes de 2º DAM. Comparte y descubre recursos educativos organizados por asignaturas.

## 🚀 Stack Tecnológico

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript (Strict Mode)
- **Base de Datos:** MySQL 8.0 (Docker)
- **ORM:** Prisma
- **Auth:** NextAuth.js v4.24.5
- **UI:** Tailwind CSS + Lucide React

## 📋 Requisitos Previos

- Node.js 20+
- Docker y Docker Compose
- npm

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/wikidam.git
cd wikidam
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Iniciar con Docker

```bash
# Iniciar servicios (MySQL + App)
docker-compose up -d

# Esperar a que MySQL esté listo (~30 segundos)
# Verificar logs
docker-compose logs -f db

# Ejecutar migraciones
docker-compose exec app npx prisma migrate dev --name init

# Poblar base de datos
docker-compose exec app npx prisma db seed
```

### 4. Desarrollo local (sin Docker para la app)

```bash
# Iniciar solo MySQL
docker-compose up -d db

# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev --name init

# Poblar base de datos
npx prisma db seed

# Iniciar servidor de desarrollo
npm run dev
```

## 🔐 Credenciales por defecto

- **Admin:** admin@wikidam.com / admin123
- **MySQL:** root / admin123

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/          # Login & Register
│   ├── (dashboard)/     # Dashboard protegido
│   ├── api/             # API Routes
│   └── page.tsx         # Landing page
├── components/          # Componentes reutilizables
├── lib/                 # Utilidades (prisma, auth)
└── types/               # TypeScript declarations
```

## 🐳 Docker

```bash
# Build y start
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down

# Eliminar volúmenes (¡borra datos!)
docker-compose down -v
```

## 📝 Variables de Entorno

Ver `.env.example` para la lista completa.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT.
