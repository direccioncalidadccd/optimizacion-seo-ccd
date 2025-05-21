import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    domains: ['pub-9d2abfa175714e64aed33b90722a9fd5.r2.dev'],
  },
  webpack(config) {
    config.stats = 'errors-only'; // 🔥 Aquí filtramos solo errores
    return config;
  },
  // Otras configuraciones
  async redirects() {
    return [
      // Corrige posibles redirecciones incorrectas aquí
      {
        source: '/plataforma/mis-cursos/:curso/undefined',
        destination: '/plataforma/mis-cursos/:curso',
        permanent: false,
      },
    ];
  },

  
};



export default withPWA({
  dest: "public",
  register: true,
})(nextConfig);
