import { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.otorrinonet.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/servicios", "/agendar", "/perfil", "/contacto", "/ubicacion"],
        disallow: ["/staff/", "/login/", "/api/", "/(patient)/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
