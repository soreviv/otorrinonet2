const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Physician",
      "@id": "https://otorrinonet.com/#physician",
      name: "Dr. Alejandro Viveros Domínguez",
      image: "https://otorrinonet.com/assets/dr-viveros-perfil.jpg",
      url: "https://otorrinonet.com",
      email: "contacto@otorrinonet.com",
      medicalSpecialty: {
        "@type": "MedicalSpecialty",
        name: "Otolaryngology",
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "Chosica 730",
        addressLocality: "Lindavista, Gustavo A. Madero",
        addressRegion: "Ciudad de México",
        postalCode: "07300",
        addressCountry: "MX",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 19.4909,
        longitude: -99.1312,
      },
      hasMap: "https://maps.app.goo.gl/f5hcoJKatHBB8K4i9",
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday"],
          opens: "16:00",
          closes: "20:00",
        },
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Thursday", "Friday"],
          opens: "10:00",
          closes: "14:00",
        },
      ],
      priceRange: "$$",
    },
    {
      "@type": "WebSite",
      "@id": "https://otorrinonet.com/#website",
      name: "Dr. Alejandro Viveros Domínguez ORL",
      url: "https://otorrinonet.com",
      description:
        "Otorrinolaringólogo y Cirujano de Cabeza y Cuello en Lindavista, Ciudad de México",
      inLanguage: "es-MX",
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://otorrinonet.com/#breadcrumb",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio",    item: "https://otorrinonet.com" },
        { "@type": "ListItem", position: 2, name: "Perfil",    item: "https://otorrinonet.com/perfil" },
        { "@type": "ListItem", position: 3, name: "Servicios", item: "https://otorrinonet.com/servicios" },
        { "@type": "ListItem", position: 4, name: "Ubicación", item: "https://otorrinonet.com/ubicacion" },
        { "@type": "ListItem", position: 5, name: "Contacto",  item: "https://otorrinonet.com/contacto" },
      ],
    },
  ],
}

const serialized = JSON.stringify(schema)

export function SiteJsonLd({ nonce }: { nonce: string }) {
  return (
    <script
      nonce={nonce || undefined}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialized }}
    />
  )
}
