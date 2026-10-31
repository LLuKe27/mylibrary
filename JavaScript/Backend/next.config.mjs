/** @type {import('next').NextConfig} */
const nextConfig = {
  // oxigraph usa WebAssembly: carregado diretamente pelo Node, sem bundling.
  serverExternalPackages: ['oxigraph'],
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
};

export default nextConfig;

