import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
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
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",    value: "nosniff" },
          { key: "X-DNS-Prefetch-Control",     value: "on" },
          { key: "Referrer-Policy",            value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",         value: "camera=(), microphone=(), geolocation=()" },
          // Mantenido por compatibilidad con navegadores sin soporte CSP3;
          // frame-ancestors en el CSP del middleware tiene prioridad en navegadores modernos.
          { key: "X-Frame-Options",            value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;
