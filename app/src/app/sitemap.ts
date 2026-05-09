import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://otorrinonet.com";
  const now = new Date();

  return [
    { url: base,                    lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/perfil`,        lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/servicios`,     lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/ubicacion`,     lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/contacto`,      lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/agendar`,       lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${base}/vacunacion`,             lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/consentimientos`,        lastModified: now, changeFrequency: "yearly",  priority: 0.6 },
    { url: `${base}/consentimientos/amigdalectomia`,    lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/consentimientos/rinoseptoplastia`,  lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/privacidad`,             lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/terminos`,      lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/cookies`,       lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/descargo`,      lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];
}
