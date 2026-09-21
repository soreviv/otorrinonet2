import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Genera .next/standalone con un server.js autocontenido optimizado para producción.
  output: "standalone",

  images: {
    formats: ["image/avif", "image/webp"],
  },

  async redirects() {
    return [
      { source: '/legal/privacidad', destination: '/privacidad', permanent: true },
      { source: '/legal/terminos',   destination: '/terminos',   permanent: true },
      { source: '/legal/cookies',    destination: '/cookies',    permanent: true },
      { source: '/legal/descargo',   destination: '/descargo',   permanent: true },
    ]
  },

  async headers() {
    return [
      {
        source: "/assets/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        source: "/assets/tienda/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, immutable, max-age=31536000" },
        ],
      },
    ];
  },
};

export default nextConfig;
