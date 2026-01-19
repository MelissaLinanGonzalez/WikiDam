Pasos para instalar WikiDam en otro ordenador
Requisitos previos: Tener instalado Docker Desktop y Git.

1. Clonar el repositorio
Descargar la carpeta del proyecto y entrar en ella.

Bash

git clone <URL_DE_TU_REPO_GITHUB>
cd WikiDam
2. Crear el archivo de configuración (.env) ⚠️ IMPORTANTE
Como las contraseñas no se suben a GitHub, hay que crear este archivo manualmente.

Crear un archivo llamado .env en la raíz del proyecto.

Pegar el siguiente contenido (ajustando la IP si es necesario, pero localhost suele valer para pruebas locales):

Fragmento de código

# Configuración de Base de Datos (Dentro de Docker)
DATABASE_URL="mysql://user:password@wikidam-db:3306/wikidam"

# Configuración de NextAuth
# IMPORTANTE: Si es producción, usar un string aleatorio largo
NEXTAUTH_SECRET="tu-secreto-super-seguro"
NEXTAUTH_URL="http://localhost:3000"

# (Opcional) Variables de API si las usas
# ...
3. Arrancar los contenedores 🚀
Esto descargará Node.js, MySQL y configurará todo el entorno aislado.

Bash

docker compose up -d --build
(Esperar a que termine de descargar y construir todo).

4. Preparar la Base de Datos 🛠️
Al ser una instalación nueva, la base de datos está vacía (sin tablas ni usuario admin). Hay que ejecutar estos dos comandos para "llenarla":

A. Crear las tablas (Migración):

Bash

docker compose exec app npx prisma migrate deploy
B. Crear el usuario Administrador (Semilla):

Bash

docker compose exec app npx prisma db seed
5. Ajustar permisos de archivos (Solo Linux/Mac) 🐧
Para que se puedan subir imágenes sin errores de permisos:

Bash

sudo chmod -R 777 public/uploads
¡Y listo! 🎉
Ahora pueden abrir el navegador en: 👉 http://localhost:3000

Y entrar con el usuario administrador por defecto:

User: admin@wikidam.com

Pass: admin123

¿Quieres que te redacte el archivo README.md completo?
Si quieres, puedo prepararte un texto bonito en formato Markdown con el título de tu proyecto, una descripción y estos pasos de instalación ya formateados para que solo tengas que copiarlo y subirlo a tu GitHub. ¿Te parece bien?
