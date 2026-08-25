import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://otorrinonet.com";
  const now = new Date();

  // Productos activos para incluir sus páginas de detalle
  const productos = await prisma.product.findMany({
    where: { activo: true },
    select: { slug: true, updatedAt: true },
  }).catch(() => []);

  const productosEntries: MetadataRoute.Sitemap = productos.map((p) => ({
    url: `${base}/tienda/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    // ─── Páginas principales ───────────────────────────────────────────────
    { url: base,                   lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/perfil`,       lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/servicios`,    lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/agendar`,      lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${base}/ubicacion`,    lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/contacto`,     lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    // ─── Tienda ────────────────────────────────────────────────────────────
    { url: `${base}/tienda`,       lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    ...productosEntries,
    // ─── Contenido clínico ─────────────────────────────────────────────────
    { url: `${base}/vacunacion`,                          lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/consentimientos`,                     lastModified: now, changeFrequency: "yearly",  priority: 0.6 },
    { url: `${base}/consentimientos/amigdalectomia`,      lastModified: now, changeFrequency: "yearly",  priority: 0.6 },
    { url: `${base}/consentimientos/rinoseptoplastia`,    lastModified: now, changeFrequency: "yearly",  priority: 0.6 },
    // ─── Páginas legales ───────────────────────────────────────────────────
    { url: `${base}/privacidad`,   lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/terminos`,     lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/cookies`,      lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/descargo`,     lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];
}
