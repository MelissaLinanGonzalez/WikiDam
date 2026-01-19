/** @type {import('next').NextConfig} */
const nextConfig = {
  // ESTA ES LA LÍNEA MÁGICA QUE FALTA:
  output: "standalone",

  // Esto ayuda a evitar errores de imágenes externas si usas alguna
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;